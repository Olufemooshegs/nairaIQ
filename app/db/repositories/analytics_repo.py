from app.db.models import AnalyticsState
from sqlalchemy import select
from sqlalchemy import and_, desc
from datetime import datetime


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

    async def get_history(self, user_id, start: datetime | None = None, end: datetime | None = None, limit: int = 100, offset: int = 0):
        stmt = select(AnalyticsState).where(AnalyticsState.user_id == user_id)
        if start is not None:
            stmt = stmt.where(AnalyticsState.created_at >= start)
        if end is not None:
            stmt = stmt.where(AnalyticsState.created_at <= end)
        stmt = stmt.order_by(AnalyticsState.created_at.desc()).limit(limit).offset(offset)
        res = await self.db.execute(stmt)
        return res.scalars().all()

    async def get_by_profile_id(self, profile_id):
        q = select(AnalyticsState).where(AnalyticsState.profile_id == profile_id).order_by(AnalyticsState.created_at.desc())
        res = await self.db.execute(q)
        return res.scalars().all()

    async def get_by_id(self, id_):
        q = select(AnalyticsState).where(AnalyticsState.id == id_)
        res = await self.db.execute(q)
        return res.scalars().first()
