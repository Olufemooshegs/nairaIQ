from app.db.models import FinancialProfile
from sqlalchemy import select
from sqlalchemy import update


from uuid import UUID


class ProfileRepository:
    def __init__(self, db):
        self.db = db

    async def create(self, payload: dict):
        obj = FinancialProfile(
            id=payload.get("id"),
            user_id=payload.get("user_id"),
            features=payload.get("features"),
            vector=payload.get("vector"),
            scores=payload.get("scores"),
            meta=payload.get("meta"),
        )
        self.db.add(obj)
        await self.db.flush()
        return obj

    async def deactivate_prior_profiles(self, user_id: UUID) -> None:
        stmt = (
            update(FinancialProfile)
            .where(FinancialProfile.user_id == user_id, FinancialProfile.is_active == True)
            .values(is_active=False)
        )
        await self.db.execute(stmt)

    async def get_by_user_id(self, user_id):
        q = select(FinancialProfile).where(
            FinancialProfile.user_id == user_id,
            FinancialProfile.is_active == True,
        )
        res = await self.db.execute(q)
        return res.scalars().first()
