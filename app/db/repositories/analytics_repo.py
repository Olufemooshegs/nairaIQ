from app.db.models import AnalyticsState
from sqlalchemy import select


class AnalyticsRepository:
    def __init__(self, db):
        self.db = db

    async def create_snapshot(self, payload: dict):
        obj = AnalyticsState(
            id=payload.get("id"),
            user_id=payload.get("user_id"),
            profile_id=payload.get("profile_id"),
            metrics=payload.get("metrics"),
            scores=payload.get("scores"),
            meta=payload.get("meta"),
        )
        self.db.add(obj)
        await self.db.flush()
        return obj

    async def get_latest_by_user(self, user_id):
        q = select(AnalyticsState).where(AnalyticsState.user_id == user_id).order_by(AnalyticsState.created_at.desc())
        res = await self.db.execute(q)
        return res.scalars().first()

    async def get_history(self, user_id):
        q = select(AnalyticsState).where(AnalyticsState.user_id == user_id).order_by(AnalyticsState.created_at.desc())
        res = await self.db.execute(q)
        return res.scalars().all()

    async def get_by_id(self, id_):
        q = select(AnalyticsState).where(AnalyticsState.id == id_)
        res = await self.db.execute(q)
        return res.scalars().first()
