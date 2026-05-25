import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_onboarding_creates_analytics_snapshot():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # register user and get token
        resp = await ac.post("/api/v1/auth/register", json={"email": "flow@example.com", "password": "secret"})
        assert resp.status_code in (200, 201)
        token = resp.json().get("access_token")
        assert token

        headers = {"Authorization": f"Bearer {token}"}
        payload = {"monthly_income": 50000, "monthly_expenses": 20000, "savings_balance": 10000}
        r = await ac.post("/api/v1/onboarding/", json=payload, headers=headers)
        assert r.status_code in (200, 201)

        # fetch latest analytics snapshot
        a = await ac.get("/api/v1/analytics/me/latest", headers=headers)
        assert a.status_code == 200
        body = a.json()
        assert "metrics" in body and "scores" in body
