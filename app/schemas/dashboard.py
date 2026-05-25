from pydantic import BaseModel, ConfigDict
from typing import Any
from uuid import UUID
from datetime import datetime


class DashboardPayload(BaseModel):
    model_config = ConfigDict()

    profile_id: UUID
    summary: dict
    metrics: dict
    timeline: list[dict] | None = None
    created_at: datetime | None = None



class DashboardTimelineEntry(BaseModel):
    model_config = ConfigDict()

    snapshot_id: UUID | None
    profile_id: UUID | None
    version: int
    created_at: datetime | None = None
    payload: DashboardPayload
