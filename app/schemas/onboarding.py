from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class OnboardingInput(BaseModel):
    monthly_income: float
    monthly_expenses: float
    savings_balance: float = 0.0
    income_stability: str = "low"  # low|medium|high
    employment_status: str | None = None

    # Optional richer fields captured during multi-step onboarding
    monthly_expenses_by_category: Dict[str, Any] | None = None
    monthly_rent: float | None = None
    monthly_rent_range: str | None = None
    monthly_income_range: str | None = None
    dependents_range: str | None = None
    income_sources: List[str] | None = None
    primary_bank: str | None = None
    has_bvn: bool | None = None
    bvn_verified: bool | None = None
    has_nin: bool | None = None
