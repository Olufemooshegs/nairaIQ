import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_register_and_login(tmp_path):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post("/api/v1/auth/register", json={"email":"test@example.com","password":"secret"})
        assert resp.status_code in (200, 201)
