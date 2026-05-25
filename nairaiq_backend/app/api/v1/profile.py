from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db, get_current_user
from app.db.repositories.profile_repo import ProfileRepository
from app.schemas.profile import FinancialProfileOut

router = APIRouter()


@router.get("/me", response_model=FinancialProfileOut)
async def get_profile(db=Depends(get_db), user=Depends(get_current_user)):
    repo = ProfileRepository(db)
    profile = await repo.get_by_user_id(user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return FinancialProfileOut.model_validate(profile)
