import requests
from reportlab.pdfgen import canvas

# Create a valid dummy PDF
c = canvas.Canvas("dummy.pdf")
c.drawString(100, 750, "John Doe Resume")
c.drawString(100, 730, "Skills: Python, React, FastAPI")
c.save()

with open("dummy.pdf", "rb") as f:
    files = {"file": ("dummy.pdf", f, "application/pdf")}
    data = {"jd_text": "Software Engineer", "user_id": "test_user"}
    response = requests.post("http://localhost:8000/api/resume/upload", files=files, data=data)

print(response.status_code)
print(response.text)
