import requests
import time

URLS = [
    "https://artexa-backend.onrender.com/",
    "https://artexa-backend.onrender.com/api/v1/products",
    "https://artexa-backend.onrender.com/docs"
]

def check_urls():
    print("Starting backend health monitor...")
    for idx, url in enumerate(URLS):
        print(f"[{idx+1}/{len(URLS)}] Checking {url}...")
        start_time = time.time()
        try:
            # We use a longer timeout since Render can take up to 2-3 minutes to wake up
            response = requests.get(url, timeout=120)
            elapsed = time.time() - start_time
            print(f"  -> SUCCESS: Status Code {response.status_code}")
            print(f"  -> Response Time: {elapsed:.2f} seconds")
            if response.status_code != 200:
                print(f"  -> Warning: Non-200 status code. Response: {response.text[:200]}")
        except requests.exceptions.Timeout:
            print(f"  -> ERROR: Request timed out after 120 seconds!")
        except Exception as e:
            print(f"  -> ERROR: Request failed: {e}")
        print("-" * 50)

if __name__ == "__main__":
    check_urls()
    print("Health check completed.")
