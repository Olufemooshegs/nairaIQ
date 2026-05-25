from app.domain.dashboard.timeline import TimelineEngine


def test_trend_direction_simple():
    te = TimelineEngine()
    states = [
        {"metrics": {"savings_rate": 5}, "created_at": "2026-01-01T00:00:00"},
        {"metrics": {"savings_rate": 15}, "created_at": "2026-02-01T00:00:00"},
    ]
    series = te.build_timeline(states, ["savings_rate"])
    vals = [p["value"] for p in series["savings_rate"]]
    assert vals[0] < vals[-1]
