from dataclasses import dataclass
from uuid import UUID
from typing import Any


@dataclass
class FinancialProfile:
    id: UUID
    user_id: UUID
    features: dict
    vector: list
    scores: dict
    meta: dict | None = None
