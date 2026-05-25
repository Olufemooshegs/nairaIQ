from typing import Any, List
from uuid import UUID


class AnalyticsHistoryService:
    def __init__(self, repo):
        self.repo = repo

    async def get_history_for_user(self, user_id: UUID, start=None, end=None, limit=100, offset=0) -> List[Any]:
        return await self.repo.get_history(user_id, start=start, end=end, limit=limit, offset=offset)

    async def get_latest_for_user(self, user_id: UUID):
        return await self.repo.get_latest_by_user(user_id)

    async def get_by_profile(self, profile_id: UUID):
        return await self.repo.get_by_profile_id(profile_id)
