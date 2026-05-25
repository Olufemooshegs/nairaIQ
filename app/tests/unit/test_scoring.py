from app.domain.analytics import scoring


def test_compute_overall_health_basic():
    scores = {
        "pressure_score": 80.0,
        "savings_rate": 10.0,
        "debt_to_income_ratio": 90.0,
        "investment_score": 20.0,
        "emergency_fund_coverage": 50.0,
    }
    overall = scoring.compute_overall_health(scores)
    assert overall >= 0.0 and overall <= 100.0
