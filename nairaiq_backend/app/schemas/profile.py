from pydantic import BaseModel, ConfigDict
from typing import Any
from uuid import UUID


class FinancialProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    features: dict
    vector: list
    scores: dict
    meta: dict | None = None
