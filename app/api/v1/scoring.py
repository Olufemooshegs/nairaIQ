from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db, get_current_user
from app.db.repositories.analytics_repo import AnalyticsRepository

router = APIRouter()


@router.get("/me/latest")
async def get_latest_scores(db=Depends(get_db), user=Depends(get_current_user)):
    repo = AnalyticsRepository(db)
    state = await repo.get_latest_by_user(user.id)
    if not state:
        raise HTTPException(status_code=404, detail="Analytics not found")
    return state.scores
