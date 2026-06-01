import urllib.request
import json

url = "http://127.0.0.1:8000/api/auth/register"
data = {
    "email": "test_http@gmail.com",
    "password": "password123",
    "full_name": "Test Http",
    "role": "candidate"
}
req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print("Response Code:", response.getcode())
        print("Response Body:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Error Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Other Exception:", e)
