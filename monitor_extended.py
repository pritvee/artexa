import requests
import time
import sys

URL = "https://artexa-backend.onrender.com/api/v1/products"

def check_url():
    print("Pinging Render backend... This might take up to 5 minutes!")
    start_time = time.time()
    try:
        response = requests.get(URL, timeout=300)
        elapsed = time.time() - start_time
        print(f"SUCCESS: Status Response Length: {len(response.text)}")
        print(f"Response Time: {elapsed:.2f} seconds")
        sys.exit(0)
    except requests.exceptions.Timeout:
        print("ERROR: Render backend timed out after 300 seconds!")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_url()
