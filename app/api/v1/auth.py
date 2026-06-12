from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
import os
import httpx
import random
from datetime import datetime, timedelta
from sqlalchemy import select

from pydantic import BaseModel
from app.services import register_user, authenticate_user, create_access_token_for_user, get_or_create_user_by_email
from app.db.repositories.user_repo import UserRepository
from app.core.dependencies import get_db, get_current_user
from app.schemas.auth import UserCreate, Token
from app.db.models import EmailVerification

router = APIRouter()

# Standard register/login endpoints
@router.post("/register")
async def register(user_in: UserCreate, db=Depends(get_db)):
    # check existing email to return a helpful error message
    repo = UserRepository(db)
    existing = await repo.get_by_email(user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    # create user and return token + user info
    user = await register_user(db, user_in)
    if not user:
        raise HTTPException(status_code=400, detail="Registration failed")
    token = await create_access_token_for_user(user)
    return {"access_token": token["access_token"], "user": {"id": str(user.id), "email": user.email, "first_name": user.first_name, "last_name": user.last_name, "phone_number": user.phone_number}}


@router.post("/login")
async def login(form_data: UserCreate, db=Depends(get_db)):
    user = await authenticate_user(db, form_data.email, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = await create_access_token_for_user(user)
    return {"access_token": token["access_token"], "user": {"id": str(user.id), "email": user.email, "first_name": getattr(user, "first_name", None), "last_name": getattr(user, "last_name", None), "phone_number": getattr(user, "phone_number", None)}}


# Google OAuth endpoints
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5174")


@router.get("/google")
async def google_auth_start(db=Depends(get_db)):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    # If client id isn't configured, create a dev user and short-circuit the flow
    if not client_id:
        user = await get_or_create_user_by_email(db, "dev+google@local")
        token = await create_access_token_for_user(user)
        return RedirectResponse(f"{FRONTEND_URL}/register?token={token['access_token']}")

    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/auth/google/callback")
    oauth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&response_type=code&scope=openid%20email%20profile&redirect_uri={redirect_uri}&access_type=offline&prompt=consent"
    )
    return RedirectResponse(oauth_url)


@router.get("/google/callback")
async def google_auth_callback(code: str | None = None, db=Depends(get_db)):
    if not code:
        raise HTTPException(status_code=400, detail="Missing code from Google")

    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/auth/google/callback")

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
        token_resp.raise_for_status()
        token_data = token_resp.json()
        access_token = token_data.get("access_token")

        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        userinfo_resp.raise_for_status()
        userinfo = userinfo_resp.json()
        email = userinfo.get("email")
        # attempt to extract name parts
        first_name = userinfo.get("given_name") or None
        last_name = userinfo.get("family_name") or None

    if not email:
        raise HTTPException(status_code=400, detail="Could not fetch user email from Google")

    user = await get_or_create_user_by_email(db, email, first_name=first_name, last_name=last_name)
    token = await create_access_token_for_user(user)
    return RedirectResponse(f"{FRONTEND_URL}/register?token={token['access_token']}")


@router.get("/me")
async def get_current_user_info(user=Depends(get_current_user)):
    return {"id": str(user.id), "email": user.email, "first_name": getattr(user, "first_name", None), "last_name": getattr(user, "last_name", None), "phone_number": getattr(user, "phone_number", None)}


@router.post("/send_otp")
async def send_otp(payload: dict, db=Depends(get_db)):
    email = payload.get("email") if isinstance(payload, dict) else None
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    code = str(random.randint(0, 999999)).zfill(6)
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    ev = EmailVerification(email=email, code=code, expires_at=expires_at)
    db.add(ev)
    await db.commit()
    # Send email via SMTP if configured
    if os.getenv("SMTP_SERVER"):
        try:
            from app.core.email import send_email_async
            subject = "Your NairaIQ verification code"
            body = f"Your verification code is: {code}. It expires in 10 minutes."
            html = f"<p>Your verification code is: <strong>{code}</strong></p><p>It expires in 10 minutes.</p>"
            try:
                # schedule send without awaiting to avoid blocking
                import asyncio

                asyncio.create_task(send_email_async(email, subject, body, html))
            except Exception:
                pass
        except ImportError:
            pass
    # Return code in dev when SMTP not configured for quick testing
    if not os.getenv("SMTP_SERVER"):
        return {"success": True, "code": code}
    return {"success": True}


@router.post("/verify_otp", response_model=Token)
async def verify_otp(payload: dict, db=Depends(get_db)):
    email = payload.get("email") if isinstance(payload, dict) else None
    code = payload.get("code") if isinstance(payload, dict) else None
    if not email or not code:
        raise HTTPException(status_code=400, detail="Email and code required")
    q = select(EmailVerification).where(
        EmailVerification.email == email,
        EmailVerification.code == code,
        EmailVerification.used == False,
        EmailVerification.expires_at >= datetime.utcnow(),
    )
    res = await db.execute(q)
    ev = res.scalars().first()
    if not ev:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    ev.used = True
    await db.commit()
    user = await get_or_create_user_by_email(db, email)
    token = await create_access_token_for_user(user)
    return token
