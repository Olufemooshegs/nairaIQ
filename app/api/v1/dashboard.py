from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db, get_current_user
from app.db.repositories.dashboard_repo import DashboardRepository
from app.domain.dashboard.builder import DashboardBuilder
from app.domain.dashboard.timeline import TimelineEngine
from app.schemas.dashboard import DashboardPayload

router = APIRouter()


@router.get("/{user_id}", response_model=DashboardPayload)
async def get_dashboard(user_id: str, db=Depends(get_db)):
    repo = DashboardRepository(db)
    state = await repo.get_latest_for_user(user_id)
    if not state:
        raise HTTPException(status_code=404, detail="Dashboard data not found")
    # build timeline with a few key metrics
    hist = await repo.get_history_for_user(user_id, limit=12)
    te = TimelineEngine()
    timeline = te.build_timeline(hist, ["pressure_score", "savings_rate", "financial_stability_score"]) 
    builder = DashboardBuilder()
    payload = builder.build(state, timeline=timeline)
    return DashboardPayload.model_validate(payload)
from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db, get_current_user
from app.db.repositories.analytics_repo import AnalyticsRepository
from app.domain.analytics.dashboard import DashboardBuilder
from app.schemas.dashboard import DashboardPayload, DashboardTimelineEntry

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
    timeline_entries = builder.build_timeline(states)
    return [DashboardTimelineEntry.model_validate(e) for e in timeline_entries]


@router.get("/me/timeline", response_model=list[DashboardTimelineEntry])
async def get_dashboard_timeline(db=Depends(get_db), user=Depends(get_current_user)):
    repo = AnalyticsRepository(db)
    states = await repo.get_history(user.id)
    builder = DashboardBuilder()
    timeline_entries = builder.build_timeline(states)
    return [DashboardTimelineEntry.model_validate(e) for e in timeline_entries]


# Public/demo endpoints for the landing page and unauthenticated demo use
import uuid
from datetime import datetime


@router.get("/public", response_model=DashboardPayload)
async def public_dashboard_demo():
    payload = {
        "profile_id": uuid.uuid4(),
        "summary": {"headline": "Demo: ₦100,000 salary", "priority_action": "Build an emergency fund", "financial_health": 0.6},
        "metrics": {"income": 100000, "monthly_surplus": 30000, "savings_rate": 0.3},
        "timeline": [],
        "created_at": datetime.utcnow(),
    }
    return DashboardPayload.model_validate(payload)


@router.get("/sample", response_model=DashboardPayload)
async def sample_dashboard_demo():
    payload = {
        "profile_id": uuid.uuid4(),
        "summary": {"headline": "Sample: ₦200,000 salary", "priority_action": "Start investing", "financial_health": 0.75},
        "metrics": {"income": 200000, "monthly_surplus": 80000, "savings_rate": 0.4},
        "timeline": [],
        "created_at": datetime.utcnow(),
    }
    return DashboardPayload.model_validate(payload)


@router.get("/demo", response_model=DashboardPayload)
async def demo_dashboard_demo():
    payload = {
        "profile_id": uuid.uuid4(),
        "summary": {"headline": "Demo: ₦50,000 salary", "priority_action": "Reduce rent pressure", "financial_health": 0.4},
        "metrics": {"income": 50000, "monthly_surplus": 5000, "savings_rate": 0.1},
        "timeline": [],
        "created_at": datetime.utcnow(),
    }
    return DashboardPayload.model_validate(payload)
