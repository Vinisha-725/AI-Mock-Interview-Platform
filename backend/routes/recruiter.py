from fastapi import APIRouter, HTTPException
from database import db
from models import RecruiterProfileUpdate
from typing import List, Dict, Optional

router = APIRouter()

@router.get("/recruiter/profile")
async def get_profile(user_id: str):
    profile = db.get_recruiter_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/recruiter/profile")
async def update_profile(data: RecruiterProfileUpdate):
    payload = {
        "company_name": data.company_name,
        "company_description": data.company_description
    }
    updated = db.update_recruiter_profile(data.user_id, payload)
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update profile")
    return updated

@router.get("/recruiter/candidates")
async def get_all_candidates(user_id: str):
    """Get all candidates with their profiles, interview history, and job applications for a specific company"""
    try:
        profile = db.get_recruiter_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Recruiter profile not found")
            
        recruiter_company = profile.get("company_name", "").strip().lower()
        if not recruiter_company or recruiter_company == "empty":
            return []

        # Get all users with role 'candidate'
        users_response = db.client.table('users').select('*').eq('role', 'candidate').execute()
        all_candidates = users_response.data

        # Filter by company history
        all_history = db.get_all_history()
        company_history = [h for h in all_history if str(h.get('company_name', '')).strip().lower() == recruiter_company]
        candidate_ids = set(h['user_id'] for h in company_history)
        
        candidates = [c for c in all_candidates if c['id'] in candidate_ids]

        # Fetch profiles, interview history, and job applications for each candidate
        candidates_with_data = []
        for candidate in candidates:
            # Get candidate profile
            profile = db.get_candidate_profile(candidate['id'])

            # Get interview history (filtered for this company)
            history = [h for h in company_history if h['user_id'] == candidate['id']]

            # Get recent interview sessions (filtered for this company)
            sessions = db.get_user_sessions(candidate['id'])
            sessions = [s for s in sessions if str(s.get('company_name', '')).strip().lower() == recruiter_company]

            # Get job applications
            applications = db.get_candidate_applications(candidate['id'])

            candidates_with_data.append({
                "id": candidate['id'],
                "email": candidate['email'],
                "full_name": candidate.get('full_name'),
                "created_at": candidate['created_at'],
                "profile": profile if profile else None,
                "interview_history": history if history else [],
                "recent_sessions": sessions if sessions else [],
                "job_applications": applications if applications else [],
                "total_interviews": len(history) if history else 0,
                "average_score": sum(h['total_score'] for h in history) // len(history) if history else 0,
                "applied_roles": [app['job_descriptions']['title'] for app in applications] if applications else []
            })

        return candidates_with_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch candidates: {str(e)}")

@router.get("/recruiter/candidates/{candidate_id}")
async def get_candidate_details(candidate_id: str, user_id: str):
    """Get detailed information about a specific candidate"""
    try:
        recruiter_profile = db.get_recruiter_profile(user_id)
        if not recruiter_profile:
            raise HTTPException(status_code=404, detail="Recruiter profile not found")
        recruiter_company = recruiter_profile.get("company_name", "").strip().lower()

        # Get user
        user = db.client.table('users').select('*').eq('id', candidate_id).execute()
        if not user.data:
            raise HTTPException(status_code=404, detail="Candidate not found")

        candidate = user.data[0]

        # Get profile
        profile = db.get_candidate_profile(candidate_id)

        # Get interview history
        history = db.get_user_history(candidate_id)
        history = [h for h in history if str(h.get('company_name', '')).strip().lower() == recruiter_company]

        if not history:
            raise HTTPException(status_code=403, detail="Candidate has not interviewed with your company")

        # Get interview sessions with detailed answers
        sessions = db.get_user_sessions(candidate_id)
        sessions = [s for s in sessions if str(s.get('company_name', '')).strip().lower() == recruiter_company]

        sessions_with_details = []
        for session in sessions:
            # Get questions for this session
            questions = db.get_session_questions(session['id'])

            # Get answers for this session
            answers = db.get_session_answers(session['id'])

            sessions_with_details.append({
                **session,
                "questions": questions,
                "answers": answers
            })

        # Get job applications
        applications = db.get_candidate_applications(candidate_id)

        return {
            "id": candidate['id'],
            "email": candidate['email'],
            "full_name": candidate.get('full_name'),
            "created_at": candidate['created_at'],
            "profile": profile if profile else None,
            "interview_history": history,
            "interview_sessions": sessions_with_details,
            "job_applications": applications if applications else [],
            "total_interviews": len(history) if history else 0,
            "average_score": sum(h['total_score'] for h in history) // len(history) if history else 0
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch candidate details: {str(e)}")

@router.get("/recruiter/analytics")
async def get_recruiter_analytics(user_id: str):
    """Get overall analytics for the recruiter dashboard"""
    try:
        recruiter_profile = db.get_recruiter_profile(user_id)
        if not recruiter_profile:
            raise HTTPException(status_code=404, detail="Recruiter profile not found")
        recruiter_company = recruiter_profile.get("company_name", "").strip().lower()

        if not recruiter_company or recruiter_company == "empty":
            return {
                "total_candidates": 0,
                "total_interviews": 0,
                "average_score": 0,
                "interview_types": {},
                "recent_activity_count": 0,
                "top_performers": []
            }

        # Get all interview history and filter by company
        all_history = db.get_all_history()
        company_history = [h for h in all_history if str(h.get('company_name', '')).strip().lower() == recruiter_company]

        # Calculate analytics
        candidate_ids = set(h['user_id'] for h in company_history)
        total_candidates = len(candidate_ids)
        total_interviews = len(company_history)
        average_score = sum(h['total_score'] for h in company_history) // len(company_history) if company_history else 0

        # Interview type breakdown
        interview_types = {}
        for h in company_history:
            interview_type = h.get('interview_type', 'unknown')
            interview_types[interview_type] = interview_types.get(interview_type, 0) + 1

        # Recent activity (last 7 days)
        from datetime import datetime, timedelta
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent_activity = [
            h for h in company_history
            if datetime.fromisoformat(h['date']).replace(tzinfo=None) >= seven_days_ago
        ]

        # Top performers
        candidate_scores = {}
        for h in company_history:
            uid = h['user_id']
            if uid not in candidate_scores:
                candidate_scores[uid] = []
            candidate_scores[uid].append(h['total_score'])

        top_performers = []
        for uid, scores in candidate_scores.items():
            avg = sum(scores) // len(scores)
            user = db.client.table('users').select('full_name, email').eq('id', uid).execute()
            if user.data:
                top_performers.append({
                    "user_id": uid,
                    "full_name": user.data[0].get('full_name'),
                    "email": user.data[0].get('email'),
                    "average_score": avg,
                    "interviews_completed": len(scores)
                })

        top_performers.sort(key=lambda x: x['average_score'], reverse=True)
        top_performers = top_performers[:5]

        return {
            "total_candidates": total_candidates,
            "total_interviews": total_interviews,
            "average_score": average_score,
            "interview_types": interview_types,
            "recent_activity_count": len(recent_activity),
            "top_performers": top_performers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")
