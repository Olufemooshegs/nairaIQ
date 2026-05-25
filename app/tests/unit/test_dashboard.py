from app.domain.analytics.dashboard import DashboardBuilder


class DummyState:
    def __init__(self, id, profile_id, metrics, scores, created_at=None):
        self.id = id
        self.profile_id = profile_id
        self.metrics = metrics
        self.scores = scores
        self.meta = {}
        self.created_at = created_at


def test_dashboard_build_and_timeline():
    builder = DashboardBuilder()
    s1 = DummyState("1", "p1", {"savings_rate": 10}, {"overall_health": 50}, created_at=None)
    s2 = DummyState("2", "p1", {"savings_rate": 20}, {"overall_health": 60}, created_at=None)
    payload = builder.build(s1)
    assert "summary" in payload and "metrics" in payload
    timeline = builder.build_timeline([s1, s2])
    assert isinstance(timeline, list) and len(timeline) == 2
