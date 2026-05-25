from app.domain.analytics.engine import AnalyticsEngine


def test_engine_compute_metrics_basic():
    engine = AnalyticsEngine()
    features = {"monthly_income": 5000, "monthly_expenses": 3000, "savings_balance": 10000}
    fm = engine.compute_metrics(features)
    assert hasattr(fm, "pressure_score")
    assert hasattr(fm, "overall_health_score")
    assert 0.0 <= fm.overall_health_score <= 100.0
