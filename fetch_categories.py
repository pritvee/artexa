import requests

try:
    response = requests.get('http://localhost:8000/api/v1/products/categories')
    if response.status_code == 200:
        print(response.json())
    else:
        print(f"Error: {response.status_code}")
except Exception as e:
    print(f"Error: {e}")
