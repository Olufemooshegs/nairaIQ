from typing import Any, List
from uuid import UUID
from datetime import datetime


class ProfileHistoryService:
    """Manage immutable profile snapshots.

    This service composes both the history repository (for full history)
    and the profile repository (for the current active profile). Keeping
    these concerns separate avoids adding history-specific queries to the
    core profile repository and adheres to Single Responsibility.
    """

    def __init__(self, history_repo, profile_repo):
        self.history_repo = history_repo
        self.profile_repo = profile_repo

    async def get_profile_history(self, user_id: UUID) -> List[Any]:
        return await self.history_repo.get_profiles_for_user(user_id)

    async def get_current_profile(self, user_id: UUID) -> Any:
        return await self.profile_repo.get_by_user_id(user_id)
