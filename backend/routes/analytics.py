from fastapi import APIRouter
from models import Report

router = APIRouter()

# In-memory storage for reports
reports = {}

@router.get("/report/{report_id}", response_model=Report)
async def get_report(report_id: str):
    # Mock report generation
    if report_id not in reports:
        reports[report_id] = Report(
            readiness_score=78,
            strengths=[
                "Strong technical knowledge in JavaScript and React",
                "Good communication skills",
                "Problem-solving approach is structured"
            ],
            weaknesses=[
                "Could improve on system design concepts",
                "Needs more experience with backend technologies",
                "Time management during coding challenges"
            ],
            question_count=5,
            total_score=78
        )
    return reports[report_id]
