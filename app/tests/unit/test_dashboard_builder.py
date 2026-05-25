from app.domain.dashboard.builder import DashboardBuilder


def test_builder_basic():
    builder = DashboardBuilder()
    dummy_state = {"metrics": {"savings_rate": 10}, "scores": {"overall_health": 50}}
    payload = builder.build(dummy_state)
    assert "summary" in payload and "scores" in payload
