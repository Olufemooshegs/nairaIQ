from typing import Dict, Any


WEIGHTS = {
    # keys expect values in 0-100 (higher is better)
    "pressure_score": 0.25,  # inverted pressure (lower pressure -> higher value)
    "savings_rate": 0.2,
    "debt_to_income_ratio": 0.2,  # converted to a 0-100 goodness score before passing
    "investment_score": 0.2,
    "emergency_fund_coverage": 0.15,
}


def _clamp_0_100(v: float) -> float:
    try:
        fv = float(v)
    except Exception:
        return 0.0
    if fv != fv:
        return 0.0
    return max(0.0, min(100.0, fv))


def compute_overall_health(scores: Dict[str, float]) -> float:
    """Compute a weighted overall health score. `scores` must contain keys
    with values in 0-100. Missing keys are treated as 0.
    """
    total_weight = sum(WEIGHTS.values())
    if total_weight <= 0:
        return 0.0
    accum = 0.0
    for k, w in WEIGHTS.items():
        val = _clamp_0_100(scores.get(k, 0.0))
        accum += val * w
    overall = accum / total_weight
    return round(overall, 2)
