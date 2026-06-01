from config import load_local_env
load_local_env()

from database import db
from models import SessionHistory
from datetime import datetime

history = SessionHistory(
    session_id="test-1234",
    user_id="c1551531-f7bf-45b2-b374-3655fbf3bc1e",
    interview_type="ai",
    date=datetime.now(),
    duration_minutes=15,
    total_score=85,
    questions_count=5,
    status="completed"
)

try:
    print("Testing create_session_history...")
    payload = history.model_dump(mode="json")
    
    # Simulate what persist_history will do
    # session_record = db.get_interview_session(payload["session_id"])
    # payload["session_id"] = session_record["id"]
    
    # Hardcoded test
    payload["interview_id"] = payload["session_id"]
    payload["session_id"] = "4a167852-aaac-4f77-809b-a94c9d1aa703"
    
    res = db.create_session_history(payload)
    print("Success:", res)
except Exception as e:
    print("Error:", repr(e))
