import requests

with open("dummy.txt", "w") as f:
    f.write("This is a dummy resume text.")

with open("dummy.txt", "rb") as f:
    files = {"file": ("dummy.txt", f, "text/plain")}
    data = {"jd_text": "Software Engineer", "user_id": "test_user"}
    response = requests.post("http://localhost:8000/api/resume/upload", files=files, data=data)

print(response.status_code)
print(response.text)
