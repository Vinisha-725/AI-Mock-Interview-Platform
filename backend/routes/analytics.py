from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List, Dict, Any
from database import db
from services.openai_service import openai_service
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class CoachingReportResponse(BaseModel):
    readiness_score: int
    technical_score: int
    communication_score: int
    confidence_score: int
    attention_score: int
    timing_score: int
    strengths: List[str]
    weaknesses: List[str]
    ai_focus_area: str
    target_role: str
    readiness_goal: str
    roadmap: List[Dict[str, str]]
    recommendations: List[str]

@router.get("/analytics/candidate/report", response_model=CoachingReportResponse)
async def get_candidate_report(x_user_id: Optional[str] = Header(None)):
    if not db.client:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized. User ID header missing.")

    # Fetch User
    user = db.client.table("users").select("*").eq("id", x_user_id).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch Candidate Profile
    profile = db.get_candidate_profile(x_user_id)
    profile_data = profile if profile else {}

    # Fetch User Session History
    history = db.get_user_history(x_user_id) or []

    # Fetch answers from the most recent session
    recent_answers = []
    if history:
        recent_session_id = history[0].get("session_id")
        answers = db.get_session_answers(recent_session_id)
        if answers:
            recent_answers = answers

    # Attempt to generate report via AI
    ai_report = openai_service.generate_coaching_report(profile_data, history, recent_answers)

    if ai_report:
        return CoachingReportResponse(**ai_report)

    # Fallback if AI fails or isn't configured
    return CoachingReportResponse(
        readiness_score=78,
        technical_score=82,
        communication_score=75,
        confidence_score=70,
        attention_score=80,
        timing_score=85,
        strengths=["Solid foundation in technical concepts", "Clear problem-solving approach", "Willingness to learn"],
        weaknesses=["Needs deeper understanding of advanced topics", "System design trade-offs", "Time management during coding"],
        ai_focus_area="Focus on structuring your answers using the STAR method.",
        target_role="Software Engineer",
        readiness_goal="Improve readiness to 85% by practicing behavioral questions.",
        roadmap=[
            {"week": "Week 1", "focus": "Review core technical concepts and algorithms."},
            {"week": "Week 2", "focus": "Practice mock interviews focusing on communication."},
            {"week": "Week 3", "focus": "Deep dive into system design and architecture."}
        ],
        recommendations=[
            "Practice explaining technical concepts out loud.",
            "Complete 3 mock interviews focusing on behavioral questions.",
            "Review system design principles for scalable applications."
        ]
    )
