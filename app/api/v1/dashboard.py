from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db, get_current_user
from app.db.repositories.analytics_repo import AnalyticsRepository
from app.domain.analytics.dashboard import DashboardBuilder
from app.schemas.dashboard import DashboardPayload

router = APIRouter()


@router.get("/me/latest", response_model=DashboardPayload)
async def get_latest_dashboard(db=Depends(get_db), user=Depends(get_current_user)):
    repo = AnalyticsRepository(db)
    state = await repo.get_latest_by_user(user.id)
    if not state:
        raise HTTPException(status_code=404, detail="Analytics not found")
    builder = DashboardBuilder()
    payload = builder.build(state)
    return DashboardPayload.model_validate(payload)


@router.get("/me/history", response_model=list[DashboardPayload])
async def get_dashboard_history(db=Depends(get_db), user=Depends(get_current_user)):
    repo = AnalyticsRepository(db)
    states = await repo.get_history(user.id)
    builder = DashboardBuilder()
    timelines = [builder.build(s) for s in states]
    return [DashboardPayload.model_validate(t) for t in timelines]
