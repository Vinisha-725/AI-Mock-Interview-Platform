from fastapi import APIRouter, HTTPException
from database import db
from typing import List, Dict, Optional

router = APIRouter()

def get_user_id() -> str:
    # TODO: Replace with actual authentication
    return "00000000-0000-0000-0000-000000000000"

@router.get("/recruiter/candidates")
async def get_all_candidates():
    """Get all candidates with their profiles, interview history, and job applications"""
    try:
        # Get all users with role 'candidate'
        users_response = db.client.table('users').select('*').eq('role', 'candidate').execute()
        candidates = users_response.data

        # Fetch profiles, interview history, and job applications for each candidate
        candidates_with_data = []
        for candidate in candidates:
            # Get candidate profile
            profile = db.get_candidate_profile(candidate['id'])

            # Get interview history
            history = db.get_user_history(candidate['id'])

            # Get recent interview sessions
            sessions = db.get_user_sessions(candidate['id'])

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
async def get_candidate_details(candidate_id: str):
    """Get detailed information about a specific candidate"""
    try:
        # Get user
        user = db.client.table('users').select('*').eq('id', candidate_id).execute()
        if not user.data:
            raise HTTPException(status_code=404, detail="Candidate not found")

        candidate = user.data[0]

        # Get profile
        profile = db.get_candidate_profile(candidate_id)

        # Get interview history
        history = db.get_user_history(candidate_id)

        # Get interview sessions with detailed answers
        sessions = db.get_user_sessions(candidate_id)

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
            "interview_history": history if history else [],
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
async def get_recruiter_analytics():
    """Get overall analytics for the recruiter dashboard"""
    try:
        # Get all candidates
        users_response = db.client.table('users').select('*').eq('role', 'candidate').execute()
        candidates = users_response.data

        # Get all interview history
        all_history = db.get_all_history()

        # Calculate analytics
        total_candidates = len(candidates)
        total_interviews = len(all_history)
        average_score = sum(h['total_score'] for h in all_history) // len(all_history) if all_history else 0

        # Interview type breakdown
        interview_types = {}
        for h in all_history:
            interview_type = h.get('interview_type', 'unknown')
            interview_types[interview_type] = interview_types.get(interview_type, 0) + 1

        # Recent activity (last 7 days)
        from datetime import datetime, timedelta
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent_activity = [
            h for h in all_history
            if datetime.fromisoformat(h['date']) >= seven_days_ago
        ]

        # Top performers
        candidate_scores = {}
        for h in all_history:
            user_id = h['user_id']
            if user_id not in candidate_scores:
                candidate_scores[user_id] = []
            candidate_scores[user_id].append(h['total_score'])

        top_performers = []
        for user_id, scores in candidate_scores.items():
            avg = sum(scores) // len(scores)
            user = db.client.table('users').select('full_name, email').eq('id', user_id).execute()
            if user.data:
                top_performers.append({
                    "user_id": user_id,
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
