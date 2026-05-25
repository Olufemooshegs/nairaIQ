from app.domain.analytics import metrics


def test_compute_investment_score():
    features = {"investment_balance": 12000, "monthly_income": 1000}
    score = metrics.compute_investment_score(features)
    assert score == 100.0 or score >= 1.0


def test_compute_emergency_coverage():
    features = {"monthly_income": 5000, "savings_balance": 5000}
    cov = metrics.compute_emergency_coverage(features)
    assert cov >= 0.0 and cov <= 100.0


def test_debt_to_income_ratio():
    features = {"monthly_income": 4000, "monthly_debt_payments": 400}
    dti = metrics.compute_debt_to_income_ratio(features)
    assert abs(dti - 0.1) < 0.01
