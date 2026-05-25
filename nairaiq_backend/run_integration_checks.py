import asyncio
from httpx import AsyncClient
from app.main import app

async def main():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        print('POST /api/v1/auth/register ->', await safe_post(ac, "/api/v1/auth/register", {"email":"test@example.com","password":"secret"}))
        print('POST /api/v1/onboarding/ ->', await safe_post(ac, "/api/v1/onboarding/", {"monthly_income":50000,"monthly_expenses":20000,"savings_balance":10000,"income_stability":"high"}))


async def safe_post(ac, url, json):
    try:
        resp = await ac.post(url, json=json)
        return resp.status_code
    except Exception as e:
        return f"ERROR: {e}"

if __name__ == '__main__':
    asyncio.run(main())
