from app.domain.dashboard.timeline import TimelineEngine


def test_timeline_series():
    te = TimelineEngine()
    states = [
        {"metrics": {"pressure_score": 10}, "created_at": "2026-01-01T00:00:00"},
        {"metrics": {"pressure_score": 8}, "created_at": "2026-02-01T00:00:00"},
    ]
    series = te.build_timeline(states, ["pressure_score"])
    assert "pressure_score" in series
