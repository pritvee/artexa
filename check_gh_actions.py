import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://api.github.com/repos/pritvee/artexa.in/actions/runs")
req.add_header('User-Agent', 'Mozilla/5.0')
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode())
        runs = data.get("workflow_runs", [])
        for run in runs[:3]:
            print(f"Run ID: {run['id']}, Name: {run['name']}")
            print(f"Status: {run['status']}, Conclusion: {run['conclusion']}")
            print(f"Created at: {run['created_at']}")
            print(f"Message: {run['head_commit']['message']}")
            print("-" * 40)
except Exception as e:
    print(f"Error: {e}")
