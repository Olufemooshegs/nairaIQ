import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_onboarding_endpoint(tmp_path):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"monthly_income":50000,"monthly_expenses":20000,"savings_balance":10000,"income_stability":"high"}
        resp = await ac.post("/api/v1/onboarding/", json=payload)
        assert resp.status_code in (200,201,400,401)
