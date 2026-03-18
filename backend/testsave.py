import requests
import json
import os

base_url = "http://localhost:8000/api/v1"

# Login as admin
login_data = {"username": "admin@example.com", "password": os.getenv("ADMIN_PASSWORD", "")}
r = requests.post(f"{base_url}/auth/login", data=login_data)
if r.status_code != 200:
    print("Login failed:", r.text)
    exit(1)

token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Get a product
r = requests.get(f"{base_url}/products/")
products = r.json()["items"]
if not products:
    print("No products found")
    exit(1)

product = products[0]

# Update product
payload = {
    "name": product["name"],
    "description": product.get("description", ""),
    "price": product["price"],
    "stock": product["stock"],
    "category_id": product["category_id"],
    "customization_type": product.get("customization_type", "Frame"),
    "customization_schema": {"sizes": [], "colors": [], "styles": []},
    "image_url": product.get("image_url", "")
}

print("Payload:", json.dumps(payload, indent=2))
r = requests.patch(f"{base_url}/admin/products/{product['id']}", json=payload, headers=headers)
print("Status:", r.status_code)
print("Response:", r.text)

