from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db, get_current_user
from app.db.repositories.profile_repo import ProfileRepository
from app.schemas.profile import FinancialProfileOut
from app.schemas.onboarding import OnboardingInput
from app.domain.profile.engine import ProfileEngine
import re
from fastapi import UploadFile, File
from app.config import settings
from app.db.repositories.user_repo import UserRepository
import httpx
from uuid import uuid4
import io
from PIL import Image

router = APIRouter()


@router.get("/me", response_model=FinancialProfileOut)
async def get_profile(db=Depends(get_db), user=Depends(get_current_user)):
    repo = ProfileRepository(db)
    profile = await repo.get_by_user_id(user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return FinancialProfileOut.model_validate(profile)


@router.post("/update", response_model=FinancialProfileOut)
async def update_profile(payload: dict, db=Depends(get_db), user=Depends(get_current_user)):
    """Update a user's profile/settings and recompute a fresh FinancialProfile + analytics snapshot.

    The endpoint accepts partial onboarding-like fields (monthly_income_range, monthly_expenses_by_category,
    monthly_income, monthly_expenses, etc.) and will merge them with the user's latest profile raw input
    (when available) to produce a new profile.
    """
    repo = ProfileRepository(db)
    existing = await repo.get_by_user_id(user.id)

    # extract raw stored onboarding payload if available
    raw = {}
    if existing and getattr(existing, "features", None):
        raw = existing.features.get("raw") or {}

    merged = dict(raw or {})
    merged.update(payload or {})

    def _parse_number(s):
        if s is None:
            return 0.0
        st = str(s)
        if re.search(r"no rent", st, re.I):
            return 0.0
        if "-" in st:
            parts = [re.sub(r"[^0-9]", "", p).strip() for p in st.split("-")]
            try:
                a = float(parts[0] or 0)
            except Exception:
                a = 0.0
            try:
                b = float(parts[1] or 0)
            except Exception:
                b = 0.0
            if b > 0:
                return (a + b) / 2.0
            return a or b or 0.0
        if re.search(r"and above", st, re.I):
            n = re.sub(r"[^0-9]", "", st)
            try:
                return float(n or 0)
            except Exception:
                return 0.0
        n = re.sub(r"[^0-9]", "", st)
        try:
            return float(n or 0)
        except Exception:
            return 0.0

    monthly_income = float(merged.get("monthly_income") or _parse_number(merged.get("monthly_income_range")) or (existing.features.get("monthly_income") if existing and existing.features else 0.0))

    # monthly expenses: prefer explicit numeric, else sum category breakdown, else derive from rent/target
    monthly_expenses = merged.get("monthly_expenses")
    if monthly_expenses is None:
        cat = merged.get("monthly_expenses_by_category")
        if isinstance(cat, dict):
            monthly_expenses = sum([_parse_number(v) for v in cat.values()])
        else:
            monthly_expenses = _parse_number(merged.get("monthly_rent_range") or merged.get("monthly_rent") )
            if not monthly_expenses:
                # fallback to existing profile estimate
                monthly_expenses = (existing.features.get("monthly_expenses") if existing and existing.features else 0.0)

    onboarding_input = OnboardingInput(
        monthly_income=monthly_income,
        monthly_expenses=float(monthly_expenses or 0.0),
        savings_balance=float(merged.get("savings_balance", existing.features.get("savings_balance") if existing and existing.features else 0.0)),
        income_stability=merged.get("income_stability", existing.features.get("income_stability") if existing and existing.features else "medium"),
        employment_status=merged.get("employment_status", existing.features.get("employment_status") if existing and existing.features else None),
        monthly_expenses_by_category=merged.get("monthly_expenses_by_category"),
        monthly_rent=_parse_number(merged.get("monthly_rent") or merged.get("monthly_rent_range")),
        monthly_rent_range=merged.get("monthly_rent_range"),
        monthly_income_range=merged.get("monthly_income_range"),
        dependents_range=merged.get("dependents_range"),
        income_sources=merged.get("income_sources"),
        primary_bank=merged.get("primary_bank"),
        has_bvn=merged.get("has_bvn"),
        bvn_verified=merged.get("bvn_verified"),
        has_nin=merged.get("has_nin"),
    )

    engine = ProfileEngine(db)
    profile = await engine.process(onboarding_input, user_id=user.id)
    if not profile:
        raise HTTPException(status_code=500, detail="Profile update failed")
    await db.commit()
    return FinancialProfileOut.model_validate(profile)


@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), db=Depends(get_db), user=Depends(get_current_user)):
    """Upload a user's avatar image to Supabase Storage (service role key required).

    The endpoint validates content-type and image integrity, re-encodes to WebP,
    uploads to the configured Supabase storage bucket and returns the public URL.
    """
    allowed = {"image/png", "image/jpeg", "image/webp"}
    max_size = 5 * 1024 * 1024  # 5 MB

    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail="File too large")

    # verify image can be opened
    try:
        img = Image.open(io.BytesIO(contents))
        img.verify()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # re-open for processing (Pillow requires re-open after verify)
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    max_dim = 1024
    img.thumbnail((max_dim, max_dim))
    out = io.BytesIO()
    img.save(out, format="WEBP", quality=80)
    out.seek(0)

    supabase_url = settings.SUPABASE_URL
    supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY
    bucket = settings.SUPABASE_AVATAR_BUCKET or "avatars"

    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Storage not configured")

    path = f"avatars/{user.id}/{uuid4()}.webp"
    upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{path}"

    headers = {"Authorization": f"Bearer {supabase_key}", "Content-Type": "image/webp", "x-upsert": "true"}
    async with httpx.AsyncClient() as client:
        resp = await client.put(upload_url, content=out.getvalue(), headers=headers, timeout=30.0)
        if resp.status_code not in (200, 201, 204):
            raise HTTPException(status_code=500, detail="Upload failed")

    public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{path}"

    # persist avatar_url on user
    repo = UserRepository(db)
    u = await repo.get_by_id(user.id)
    if u:
        u.avatar_url = public_url
        await db.flush()
        await db.commit()

    return {"avatar_url": public_url}
