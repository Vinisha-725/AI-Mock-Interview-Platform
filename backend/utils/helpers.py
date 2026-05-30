# Utility helper functions

def generate_report_id():
    import time
    return str(int(time.time()))

def format_score(score: int) -> str:
    if score >= 80:
        return "Excellent"
    elif score >= 60:
        return "Good"
    elif score >= 40:
        return "Average"
    else:
        return "Needs Improvement"
