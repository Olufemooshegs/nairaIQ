from typing import Dict, Any
from .models import FinancialMetrics
from . import metrics, scoring
from uuid import UUID, uuid4


class AnalyticsEngine:
    """Deterministic analytics engine that consumes a financial profile
    (features + vector + scores) and computes FinancialMetrics and derived scores.

    Responsibilities:
    - Assemble feature inputs
    - Run metric computations (deterministic)
    - Compute aggregate scores
    - Produce AnalyticsState payload (serializable)
    """

    def __init__(self):
        pass

    def compute_metrics(self, features: Dict[str, Any]) -> FinancialMetrics:
        pressure = metrics.compute_pressure_score(features)
        savings_rate = metrics.compute_savings_rate(features)
        dti = metrics.compute_debt_to_income_ratio(features)
        emergency_gap = metrics.compute_emergency_fund_gap(features)
        emergency_coverage = metrics.compute_emergency_coverage(features)
        investment_score = metrics.compute_investment_score(features)
        estimated_expenses = float(features.get("estimated_monthly_expenses", features.get("monthly_expenses", 0.0) or 0.0))
        disposable = max(0.0, float(features.get("monthly_income", 0) or 0) - float(features.get("monthly_expenses", 0) or 0))
        rent_ratio = metrics.compute_rent_burden_ratio(features)
        # normalize values into 0-100 'goodness' scores expected by the scorer
        pressure_good = max(0.0, 100.0 - pressure)
        dti_good = 0.0
        try:
            if dti < 999:
                dti_good = max(0.0, 100.0 - (dti * 100.0))
        except Exception:
            dti_good = 0.0

        financial_stability = scoring.compute_overall_health({
            "pressure_score": pressure_good,
            "savings_rate": savings_rate,
            "debt_to_income_ratio": dti_good,
            "investment_score": investment_score,
            "emergency_fund_coverage": emergency_coverage,
        })

        fm = FinancialMetrics(
            pressure_score=pressure,
            savings_rate=savings_rate,
            debt_to_income_ratio=dti,
            emergency_fund_gap=emergency_gap,
            investment_score=investment_score,
            overall_health_score=financial_stability,
            estimated_monthly_expenses=estimated_expenses,
            financial_stability_score=financial_stability,
            disposable_income=disposable,
            rent_burden_ratio=rent_ratio,
        )

        return fm

    def create_analytics_state(self, user_id: UUID, profile_id: UUID, features: Dict[str, Any]) -> Dict[str, Any]:
        metrics_obj = self.compute_metrics(features)
        state = {
            "id": uuid4(),
            "user_id": user_id,
            "profile_id": profile_id,
            "metrics": metrics_obj.as_dict(),
            "scores": {"overall_health": metrics_obj.overall_health_score},
            "meta": {"deterministic": True},
        }
        return state
