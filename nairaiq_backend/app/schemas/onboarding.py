from pydantic import BaseModel
from typing import Optional


class OnboardingInput(BaseModel):
    monthly_income: float
    monthly_expenses: float
    savings_balance: float = 0.0
    income_stability: str = "low"  # low|medium|high
    employment_status: str | None = None
