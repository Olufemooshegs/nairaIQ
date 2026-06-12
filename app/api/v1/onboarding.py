from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db, get_current_user
from app.schemas.onboarding import OnboardingInput
import re
from app.domain.profile.engine import ProfileEngine
from app.db.repositories.onboarding_repo import OnboardingRepository
from app.db.repositories.profile_repo import ProfileRepository

router = APIRouter()


@router.post("/", status_code=201)
async def onboarding(input: OnboardingInput, db=Depends(get_db), user=Depends(get_current_user)):
    engine = ProfileEngine(db)
    profile = await engine.process(input, user_id=user.id)
    if not profile:
        raise HTTPException(status_code=500, detail="Profile generation failed")
    return {"profile_id": str(profile.id)}


# Step endpoints to support multi-step frontend onboarding
@router.post("/personal")
async def onboarding_personal(payload: dict, db=Depends(get_db), user=Depends(get_current_user)):
    repo = OnboardingRepository(db)
    data = dict(payload or {})
    data["user_id"] = str(user.id)
    data["step"] = "personal"
    await repo.create(data)
    await db.commit()
    return {"ok": True}


@router.post("/financial")
async def onboarding_financial(payload: dict, db=Depends(get_db), user=Depends(get_current_user)):
    repo = OnboardingRepository(db)
    data = dict(payload or {})
    data["user_id"] = str(user.id)
    data["step"] = "financial"
    await repo.create(data)
    await db.commit()
    return {"ok": True}


@router.post("/goals")
async def onboarding_goals(payload: dict, db=Depends(get_db), user=Depends(get_current_user)):
    repo = OnboardingRepository(db)
    data = dict(payload or {})
    data["user_id"] = str(user.id)
    data["step"] = "goals"
    await repo.create(data)
    await db.commit()
    return {"ok": True}


@router.post("/complete")
async def onboarding_complete(db=Depends(get_db), user=Depends(get_current_user)):
    # merge stored step payloads and run the ProfileEngine
    repo = OnboardingRepository(db)
    entries = await repo.get_by_user_id(user.id)
    merged: dict = {}
    for e in entries:
        if isinstance(e.payload, dict):
            merged.update(e.payload)
    # Map frontend fields to the OnboardingInput; include richer optional fields
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

    monthly_income = float(merged.get("monthly_income") or 0)
    # prefer explicit expenses if provided, else derive from target savings rate
    monthly_expenses = merged.get("monthly_expenses")
    if monthly_expenses is None:
        target_savings = float(merged.get("target_savings_rate") or merged.get("savingsTarget") or 20)
        monthly_expenses = monthly_income * (1 - (target_savings / 100.0)) if monthly_income > 0 else 0.0

    # derive monthly_rent from explicit numeric or range
    monthly_rent = merged.get("monthly_rent")
    if monthly_rent is None:
        monthly_rent = _parse_number(merged.get("monthly_rent_range") or merged.get("monthly_rent"))

    onboarding_input = OnboardingInput(
        monthly_income=monthly_income,
        monthly_expenses=float(monthly_expenses),
        savings_balance=float(merged.get("savings_balance", 0.0)),
        income_stability=merged.get("income_stability", "medium"),
        employment_status=merged.get("employment_status"),
        monthly_expenses_by_category=merged.get("monthly_expenses_by_category"),
        monthly_rent=monthly_rent,
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
        raise HTTPException(status_code=500, detail="Profile generation failed on complete")
    await db.commit()
    return {"profile_id": str(profile.id)}


@router.get("/status")
async def onboarding_status(db=Depends(get_db), user=Depends(get_current_user)):
    repo = OnboardingRepository(db)
    profile_repo = ProfileRepository(db)
    entries = await repo.get_by_user_id(user.id)
    steps = {e.payload.get("step") for e in entries if isinstance(e.payload, dict) and e.payload.get("step")}
    profile = await profile_repo.get_by_user_id(user.id)
    is_complete = profile is not None
    current_step = 4 if is_complete else (max([1] + [1 for _ in steps]) if steps else 1)
    return {"is_complete": is_complete, "current_step": current_step, "steps_completed": list(steps)}
