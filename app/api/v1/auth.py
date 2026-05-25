from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services import register_user, authenticate_user, create_access_token_for_user
from app.core.dependencies import get_db
from app.schemas.auth import UserCreate, Token

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db=Depends(get_db)):
    user = await register_user(db, user_in)
    if not user:
        raise HTTPException(status_code=400, detail="Registration failed")
    token = await create_access_token_for_user(user)
    return token


@router.post("/login", response_model=Token)
async def login(form_data: UserCreate, db=Depends(get_db)):
    user = await authenticate_user(db, form_data.email, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = await create_access_token_for_user(user)
    return token
