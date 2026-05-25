from typing import Any


class SnapshotService:
    """High-level operations for creating and retrieving immutable snapshots.

    This is a thin orchestration layer that may later be extended to add
    storage in archival stores or emit events for downstream processing.
    """

    def __init__(self, profile_repo, analytics_repo):
        self.profile_repo = profile_repo
        self.analytics_repo = analytics_repo

    async def create_profile_snapshot(self, payload: dict):
        # expects profile_repo.create to create a new immutable row
        return await self.profile_repo.create(payload)

    async def create_analytics_snapshot(self, payload: dict):
        return await self.analytics_repo.create_snapshot(payload)
