from typing import Dict, Any


WEIGHTS = {
    "pressure_score": 0.3,
    "savings_rate": 0.2,
    "debt_to_income_ratio": 0.2,
    "investment_score": 0.2,
    "emergency_fund_gap": 0.1,
}


def compute_overall_health(scores: Dict[str, float]) -> float:
    # Simple additive weighted score with normalization
    total_weight = sum(WEIGHTS.values())
    if total_weight <= 0:
        return 0.0
    accum = 0.0
    for k, w in WEIGHTS.items():
        accum += scores.get(k, 0.0) * w
    overall = accum / total_weight
    return round(overall, 2)
