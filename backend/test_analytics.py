from config import load_local_env
load_local_env()

from database import db
from datetime import datetime, timedelta

try:
    print("Testing get_recruiter_analytics logic...")
    users_response = db.client.table('users').select('*').eq('role', 'candidate').execute()
    candidates = users_response.data
    print("Candidates:", len(candidates))
    
    all_history = db.get_all_history()
    print("History records:", len(all_history) if all_history else 0)
    
    seven_days_ago = datetime.now() - timedelta(days=7)
    recent_activity = []
    if all_history:
        for h in all_history:
            try:
                if datetime.fromisoformat(h['date']).replace(tzinfo=None) >= seven_days_ago.replace(tzinfo=None):
                    recent_activity.append(h)
            except Exception as e:
                print(f"Error parsing date {h['date']}:", e)
                
    print("Recent activity:", len(recent_activity))
except Exception as e:
    print("Error:", repr(e))
