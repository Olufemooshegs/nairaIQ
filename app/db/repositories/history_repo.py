from app.db.models import FinancialProfile, AnalyticsState
from sqlalchemy import select


class HistoryRepository:
    def __init__(self, db):
        self.db = db

    async def get_profiles_for_user(self, user_id):
        q = select(FinancialProfile).where(FinancialProfile.user_id == user_id).order_by(FinancialProfile.created_at.desc())
        res = await self.db.execute(q)
        return res.scalars().all()

    async def get_analytics_for_user(self, user_id, start=None, end=None, limit=100, offset=0):
        q = select(AnalyticsState).where(AnalyticsState.user_id == user_id)
        if start is not None:
            q = q.where(AnalyticsState.created_at >= start)
        if end is not None:
            q = q.where(AnalyticsState.created_at <= end)
        q = q.order_by(AnalyticsState.created_at.desc()).limit(limit).offset(offset)
        res = await self.db.execute(q)
        return res.scalars().all()
