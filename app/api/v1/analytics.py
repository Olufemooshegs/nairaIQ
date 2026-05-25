from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_db, get_current_user
from app.db.repositories.analytics_repo import AnalyticsRepository
from app.schemas.analytics import AnalyticsStateOut
from typing import Optional
from datetime import datetime

router = APIRouter()


@router.get("/me/latest", response_model=AnalyticsStateOut)
async def get_latest(db=Depends(get_db), user=Depends(get_current_user)):
    repo = AnalyticsRepository(db)
    state = await repo.get_latest_by_user(user.id)
    if not state:
        raise HTTPException(status_code=404, detail="Analytics not found")
    return AnalyticsStateOut.model_validate(state)


@router.get("/me/history", response_model=list[AnalyticsStateOut])
async def get_history(
    db=Depends(get_db),
    user=Depends(get_current_user),
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    repo = AnalyticsRepository(db)
    states = await repo.get_history(user.id, start=start, end=end, limit=limit, offset=offset)
    return [AnalyticsStateOut.model_validate(s) for s in states]


@router.get("/{analytics_id}", response_model=AnalyticsStateOut)
async def get_by_id(analytics_id: str, db=Depends(get_db), user=Depends(get_current_user)):
    repo = AnalyticsRepository(db)
    state = await repo.get_by_id(analytics_id)
    if not state:
        raise HTTPException(status_code=404, detail="Analytics not found")
    # ensure ownership
    if str(state.user_id) != str(user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    return AnalyticsStateOut.model_validate(state)
