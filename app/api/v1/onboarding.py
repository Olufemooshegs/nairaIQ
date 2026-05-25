from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db, get_current_user
from app.schemas.onboarding import OnboardingInput
from app.domain.profile.engine import ProfileEngine

router = APIRouter()


@router.post("/", status_code=201)
async def onboarding(input: OnboardingInput, db=Depends(get_db), user=Depends(get_current_user)):
    engine = ProfileEngine(db)
    profile = await engine.process(input, user_id=user.id)
    if not profile:
        raise HTTPException(status_code=500, detail="Profile generation failed")
    return {"profile_id": str(profile.id)}
