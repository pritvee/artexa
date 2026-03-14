
import requests

def test_registration_and_login():
    url = "http://localhost:8000/api/v1/auth"
    email = "testuser@example.com"
    password = "testpassword123"
    name = "Test User"
    
    # 1. Register
    print(f"Registering {email}...")
    reg_data = {
        "email": email,
        "password": password,
        "name": name,
        "phone": "9999999999"
    }
    res = requests.post(f"{url}/register", json=reg_data)
    print(f"Registration response: {res.status_code}")
    print(res.json())
    
    if res.status_code == 200 or res.status_code == 400: # 400 if already exists
        # 2. Login
        print(f"Logging in {email}...")
        login_data = {
            "username": email,
            "password": password
        }
        res = requests.post(f"{url}/login", data=login_data) # OAuth2 uses form data
        print(f"Login response: {res.status_code}")
        print(res.json())
        
        if res.status_code == 200:
            print("SUCCESS: Login worked for new account!")
        else:
            print("FAILURE: Login failed for new account!")

if __name__ == "__main__":
    test_registration_and_login()
