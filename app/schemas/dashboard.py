from pydantic import BaseModel, ConfigDict
from typing import Any
from uuid import UUID


class DashboardPayload(BaseModel):
    model_config = ConfigDict()

    profile_id: UUID
    summary: dict
    metrics: dict
    timeline: list[dict] | None = None
