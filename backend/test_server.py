import traceback
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

with open("dummy.pdf", "rb") as f:
    try:
        response = client.post("/api/resume/upload", files={"file": ("dummy.pdf", f, "application/pdf")}, data={"jd_text": "Software Engineer", "user_id": "test_user"})
        print(response.status_code)
        print(response.json())
    except Exception as e:
        print("EXCEPTION RAISED:")
        traceback.print_exc()
