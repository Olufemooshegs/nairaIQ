from app.domain.history.analytics_history import AnalyticsHistoryService


def test_history_service_interface():
    class DummyRepo:
        async def get_history(self, user_id, start=None, end=None, limit=100, offset=0):
            return []

    svc = AnalyticsHistoryService(DummyRepo())
    assert hasattr(svc, "get_history_for_user")
