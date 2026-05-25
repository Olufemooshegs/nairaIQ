from app.db.models import AnalyticsState
from sqlalchemy import select


class DashboardRepository:
    def __init__(self, db):
        self.db = db

    async def get_latest_for_user(self, user_id):
        q = select(AnalyticsState).where(AnalyticsState.user_id == user_id).order_by(AnalyticsState.created_at.desc())
        res = await self.db.execute(q)
        return res.scalars().first()

    async def get_history_for_user(self, user_id, limit=100, offset=0):
        q = select(AnalyticsState).where(AnalyticsState.user_id == user_id).order_by(AnalyticsState.created_at.desc()).limit(limit).offset(offset)
        res = await self.db.execute(q)
        return res.scalars().all()
