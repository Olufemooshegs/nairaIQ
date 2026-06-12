import httpx
import time

BASE = "http://127.0.0.1:8000/api/v1"
EMAIL = f"test_onboard_{int(time.time())}@example.com"
PASSWORD = "pass123"

print('Using test account', EMAIL)

with httpx.Client(timeout=20.0) as client:
    r = client.post(f"{BASE}/auth/register", json={"email": EMAIL, "password": PASSWORD})
    print('register', r.status_code, r.text)
    if r.status_code != 200 and r.status_code != 201:
        raise SystemExit('Register failed')
    token = r.json().get('access_token')
    headers = {"Authorization": f"Bearer {token}"}

    # Step 1
    personal = {
        "date_of_birth": "1990-01-01",
        "gender": "Male",
        "state_of_residence": "Lagos",
        "occupation": "Software Engineer",
        "employment_status": "Employed",
    }
    r = client.post(f"{BASE}/onboarding/personal", json=personal, headers=headers)
    print('personal', r.status_code, r.text)

    # Step 2
    expenses_by_category = {"food": "50,000 - 100,000", "utilities": "20,000 - 50,000", "transport": "20,000 - 50,000", "data": "0 - 20,000", "entertainment": "0 - 20,000", "healthcare": "0 - 20,000"}
    financial = {
        "monthly_income_range": "200,000 - 350,000",
        "monthly_rent_range": "100,000 - 300,000",
        "dependents_range": "1 - 2",
        "income_sources": ["Salary"],
        "monthly_expenses_by_category": expenses_by_category,
        # numeric fields (frontend should send these)
        "monthly_income": 275000,
        "monthly_expenses": 210000,
        "primary_bank": "GTBank",
        "has_bvn": True,
        "bvn_verified": True,
        "has_nin": True,
    }
    r = client.post(f"{BASE}/onboarding/financial", json=financial, headers=headers)
    print('financial', r.status_code, r.text)

    # Complete
    r = client.post(f"{BASE}/onboarding/complete", headers=headers)
    print('complete', r.status_code, r.text)

    # Fetch dashboard
    r = client.get(f"{BASE}/dashboard/me/latest", headers=headers)
    print('dashboard', r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)
