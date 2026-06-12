import http.client, json, time
host='127.0.0.1'
port=8000
conn = http.client.HTTPConnection(host, port, timeout=10)
# Register
email = f'test_user_{int(time.time())}@example.com'
payload = json.dumps({'email': email, 'password': 'demo1234'})
headers = {'Content-Type': 'application/json'}
conn.request('POST', '/api/v1/auth/register', payload, headers)
res = conn.getresponse()
data = res.read().decode()
print('register', res.status, data)
if res.status != 200:
    raise SystemExit(1)
obj = json.loads(data)
token = obj['access_token']
headers_auth = {'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}
# personal
conn.request('POST', '/api/v1/onboarding/personal', json.dumps({'date_of_birth': '1990-01-01', 'gender': 'M', 'state_of_residence': 'Lagos', 'occupation': 'Engineer', 'employment_status': 'Full-time'}), headers_auth)
print('personal', conn.getresponse().status)
# financial
conn.request('POST', '/api/v1/onboarding/financial', json.dumps({'monthly_income': 250000, 'monthly_expenses': 150000, 'savings_balance': 50000, 'income_sources': ['Salary'], 'primary_bank': 'GTBank', 'has_bvn': True}), headers_auth)
print('financial', conn.getresponse().status)
# goals
conn.request('POST', '/api/v1/onboarding/goals', json.dumps({'financial_goals': ['Emergency fund'], 'risk_tolerance': 'Moderate', 'investment_experience': 'None', 'target_savings_rate': 20}), headers_auth)
print('goals', conn.getresponse().status)
# complete
conn.request('POST', '/api/v1/onboarding/complete', '', headers_auth)
res = conn.getresponse()
print('complete', res.status, res.read().decode())
# fetch dashboard
conn.request('GET', '/api/v1/dashboard', headers=headers_auth)
res = conn.getresponse()
body = res.read().decode()
print('dashboard', res.status, body)
