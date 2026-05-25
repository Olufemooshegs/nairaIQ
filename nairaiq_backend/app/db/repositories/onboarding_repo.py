from app.db.models import OnboardingInput
from sqlalchemy import select


class OnboardingRepository:
    def __init__(self, db):
        self.db = db

    async def create(self, payload: dict):
        obj = OnboardingInput(user_id=payload.get("user_id"), payload=payload)
        self.db.add(obj)
        await self.db.flush()
        return obj

    async def get_by_user_id(self, user_id):
        q = select(OnboardingInput).where(OnboardingInput.user_id == user_id)
        res = await self.db.execute(q)
        return res.scalars().all()
