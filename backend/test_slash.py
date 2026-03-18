import os
import requests

url = "http://localhost:8000/api/v1/auth"
email = "testuser@example.com"
password = os.getenv("TEST_USER_PASSWORD", "") # Required in env

print("Testing WITHOUT trailing slash...")
login_data = {"username": email, "password": password}
res = requests.post(f"{url}/login", data=login_data)
print(f"Status: {res.status_code}")

print("\nTesting WITH trailing slash...")
res = requests.post(f"{url}/login/", data=login_data)
print(f"Status: {res.status_code}")
try:
    print(res.json())
except:
    print("Could not parse JSON")
