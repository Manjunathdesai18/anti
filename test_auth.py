import urllib.request
import urllib.error
import json

# Test signup with JSON
payload = json.dumps({'username': 'testuser99', 'email': 'testuser99@test.com', 'full_name': 'Test User', 'password': 'test1234'}).encode()
req = urllib.request.Request(
    'http://localhost:8000/api/auth/signup',
    data=payload,
    headers={'Content-Type': 'application/json'},
    method='POST'
)
try:
    resp = urllib.request.urlopen(req)
    print("SIGNUP SUCCESS:", resp.read().decode())
except urllib.error.HTTPError as e:
    print("SIGNUP ERROR:", e.code, e.read().decode())

# Test login
form_data = 'username=testuser99&password=test1234'
req2 = urllib.request.Request(
    'http://localhost:8000/api/auth/login',
    data=form_data.encode(),
    headers={'Content-Type': 'application/x-www-form-urlencoded'},
    method='POST'
)
try:
    resp2 = urllib.request.urlopen(req2)
    data = json.loads(resp2.read().decode())
    print("\nLOGIN SUCCESS:")
    print("  token:", data.get('access_token', '')[:40], "...")
    print("  user:", data.get('user'))
except urllib.error.HTTPError as e:
    print("\nLOGIN ERROR:", e.code, e.read().decode())
