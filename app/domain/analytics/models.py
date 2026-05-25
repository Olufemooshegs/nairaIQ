from dataclasses import dataclass
from typing import Dict, Any
from uuid import UUID


@dataclass
class FinancialMetrics:
    pressure_score: float
    savings_rate: float
    debt_to_income_ratio: float
    emergency_fund_gap: float
    investment_score: float
    overall_health_score: float
    estimated_monthly_expenses: float
    financial_stability_score: float
    disposable_income: float
    rent_burden_ratio: float

    def as_dict(self) -> Dict[str, Any]:
        return {k: float(v) for k, v in self.__dict__.items()}
