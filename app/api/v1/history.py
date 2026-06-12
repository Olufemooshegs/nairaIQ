from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_db, get_current_user
from app.db.repositories.history_repo import HistoryRepository
from app.schemas.history import ProfileHistoryOut, AnalyticsHistoryOut
from typing import Optional
from datetime import datetime

router = APIRouter()


@router.get("/profile/{user_id}", response_model=list[ProfileHistoryOut])
async def get_profile_history(user_id: str, db=Depends(get_db), start: Optional[datetime] = Query(None), end: Optional[datetime] = Query(None), limit: int = Query(100, ge=1, le=1000), offset: int = Query(0, ge=0)):
    repo = HistoryRepository(db)
    profiles = await repo.get_profiles_for_user(user_id)
    return [ProfileHistoryOut.model_validate(p) for p in profiles]


@router.get("/analytics/{user_id}", response_model=list[AnalyticsHistoryOut])
async def get_analytics_history(user_id: str, db=Depends(get_db), start: Optional[datetime] = Query(None), end: Optional[datetime] = Query(None), limit: int = Query(100, ge=1, le=1000), offset: int = Query(0, ge=0)):
    repo = HistoryRepository(db)
    analytics = await repo.get_analytics_for_user(user_id, start=start, end=end, limit=limit, offset=offset)
    return [AnalyticsHistoryOut.model_validate(a) for a in analytics]


@router.get("/profile/me", response_model=list[ProfileHistoryOut])
async def get_profile_history_me(db=Depends(get_db), user=Depends(get_current_user)):
    repo = HistoryRepository(db)
    profiles = await repo.get_profiles_for_user(user.id)
    return [ProfileHistoryOut.model_validate(p) for p in profiles]


@router.get("/analytics/me", response_model=list[AnalyticsHistoryOut])
async def get_analytics_history_me(db=Depends(get_db), user=Depends(get_current_user)):
    repo = HistoryRepository(db)
    analytics = await repo.get_analytics_for_user(user.id)
    return [AnalyticsHistoryOut.model_validate(a) for a in analytics]
