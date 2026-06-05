from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db, get_current_user
from app.db.repositories.history_repo import HistoryRepository
from app.domain.dashboard.timeline import TimelineEngine
from typing import List

router = APIRouter()


@router.get("/{user_id}")
async def get_trends(user_id: str, db=Depends(get_db)):
    repo = HistoryRepository(db)
    states = await repo.get_analytics_for_user(user_id, limit=24)
    te = TimelineEngine()
    series = te.build_timeline(states, ["pressure_score", "savings_rate", "financial_stability_score", "disposable_income"]) 
    # simple trend summary (deterministic): compute direction for each series
    trends = {}
    for k, s in series.items():
        vals = [pt.get("value") for pt in s if pt.get("value") is not None]
        direction = "flat"
        if len(vals) >= 2:
            if vals[-1] > vals[0]:
                direction = "improving"
            elif vals[-1] < vals[0]:
                direction = "worsening"
        trends[k] = {"direction": direction, "series": s}
    return trends


@router.get("/me")
async def get_trends_me(db=Depends(get_db), user=Depends(get_current_user)):
    return await get_trends(str(user.id), db=db)
