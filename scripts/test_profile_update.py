import httpx
import time

BASE = "http://127.0.0.1:8000/api/v1"
EMAIL = f"test_profile_{int(time.time())}@example.com"
PASSWORD = "pass123"

print('Using test account', EMAIL)

with httpx.Client(timeout=20.0) as client:
    r = client.post(f"{BASE}/auth/register", json={"email": EMAIL, "password": PASSWORD})
    print('register', r.status_code, r.text)
    token = r.json().get('access_token')
    headers = {"Authorization": f"Bearer {token}"}

    # Complete onboarding quickly
    personal = {
        "date_of_birth": "1990-01-01",
        "gender": "Male",
        "state_of_residence": "Lagos",
        "occupation": "Engineer",
        "employment_status": "Employed",
    }
    client.post(f"{BASE}/onboarding/personal", json=personal, headers=headers)

    financial = {
        "monthly_income_range": "200,000 - 350,000",
        "monthly_rent_range": "50,000 - 100,000",
        "dependents_range": "0",
        "income_sources": ["Salary"],
        "monthly_income": 275000,
        "monthly_expenses": 150000,
    }
    client.post(f"{BASE}/onboarding/financial", json=financial, headers=headers)
    client.post(f"{BASE}/onboarding/complete", headers=headers)

    # Fetch initial dashboard
    r = client.get(f"{BASE}/dashboard/me/latest", headers=headers)
    print('before', r.status_code, r.json())

    # Update profile: increase income
    update = {"monthly_income_range": "400,000 - 600,000", "monthly_income": 500000}
    r = client.post(f"{BASE}/profile/update", json=update, headers=headers)
    print('update', r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)

    # Fetch dashboard after update
    r = client.get(f"{BASE}/dashboard/me/latest", headers=headers)
    print('after', r.status_code, r.json())
