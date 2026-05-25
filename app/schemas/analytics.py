from pydantic import BaseModel, ConfigDict
from typing import Any
from uuid import UUID
from datetime import datetime


class AnalyticsStateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    profile_id: UUID
    metrics: dict
    scores: dict
    meta: dict | None = None
    created_at: datetime | None = None


class FinancialInsightOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    analytics_state_id: UUID
    intent: str
    rendered: dict
    meta: dict | None = None
    created_at: datetime | None = None
