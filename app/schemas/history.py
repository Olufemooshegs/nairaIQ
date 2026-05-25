from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Any
from datetime import datetime


class ProfileHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    features: dict
    vector: list
    scores: dict
    meta: dict | None = None
    is_active: bool
    created_at: datetime | None = None


class AnalyticsHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    profile_id: UUID
    metrics: dict
    scores: dict
    meta: dict | None = None
    created_at: datetime | None = None
