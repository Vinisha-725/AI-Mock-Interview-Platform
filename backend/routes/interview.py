from fastapi import APIRouter, HTTPException
from models import (
    InterviewStartRequest, InterviewStartResponse, AnswerSubmission, AnswerResponse,
    InterviewSession, SessionHistory, Question
)
from services.ai_service import ai_service
from services.openai_service import openai_service
from database import db
from datetime import datetime
from typing import Dict, Optional
import uuid

router = APIRouter()

# Helper function to get user_id from request (simplified - add proper auth later)
def get_user_id() -> str:
    # TODO: Replace with actual authentication
    # For now, return a default user ID
    return "00000000-0000-0000-0000-000000000000"

@router.post("/interview/start", response_model=InterviewStartResponse)
async def start_interview(request: InterviewStartRequest):
    interview_id = ai_service.generate_interview_id()
    start_time = datetime.now()
    user_id = get_user_id()

    # Create session in database
    session_data = {
        "interview_id": interview_id,
        "user_id": user_id,
        "interview_type": request.interview_type,
        "skills": request.skills,
        "projects": [p.model_dump() if hasattr(p, 'model_dump') else p for p in request.projects],
        "jd_text": request.jd_text,
        "start_time": start_time.isoformat(),
        "duration_minutes": 15,
        "questions_asked": [],
        "answers_given": {},
        "scores": [],
        "consecutive_wrong_answers": 0,
        "total_score": 0,
        "status": "active"
    }

    db.create_interview_session(session_data)

    # Generate the first question with OpenAI when configured, otherwise use the local bank.
    question = openai_service.generate_interview_question(
        interview_id=interview_id,
        interview_type=request.interview_type,
        skills=request.skills,
        projects=request.projects,
        jd_text=request.jd_text,
        question_number=1,
        previous_questions=[],
    )

    if question is None:
        question = ai_service.get_first_question(
            skills=request.skills,
            projects=request.projects,
            jd_text=request.jd_text,
            interview_type=request.interview_type,
            session_id=interview_id
        )

    # Update session with first question
    session = db.get_interview_session(interview_id)
    if session:
        questions_asked = session.get("questions_asked", [])
        questions_asked.append(question.id)
        db.update_interview_session(interview_id, {"questions_asked": questions_asked})

    # Store question in database
    session_record = db.get_interview_session(interview_id)
    if session_record:
        db.create_interview_question({
            "session_id": session_record["id"],
            "question_id": question.id,
            "question_text": question.question,
            "difficulty": question.difficulty,
            "category": question.category
        })

    return InterviewStartResponse(
        interview_id=interview_id,
        question=question,
        duration_minutes=15,
        start_time=start_time.isoformat()
    )

@router.post("/interview/answer", response_model=AnswerResponse)
async def submit_answer(submission: AnswerSubmission):
    interview_id = submission.interview_id

    # Get session from database
    session = db.get_interview_session(interview_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    if session.get("status") != "active":
        raise HTTPException(status_code=400, detail="Interview is not active")

    # Find the actual question being answered
    current_question_id = submission.question_id or session["questions_asked"][-1]
    session_questions = db.get_session_questions(session["id"])
    current_question = None
    for q in session_questions:
        if q["question_id"] == current_question_id:
            current_question = Question(
                id=q["question_id"],
                question=q["question_text"],
                difficulty=q.get("difficulty", "medium"),
                category=q.get("category", "technical")
            )
            break

    if current_question is None:
        raise HTTPException(status_code=400, detail="Question not found for this interview session")

    # Evaluate the answer with OpenAI when configured, otherwise use the local scorer.
    openai_evaluation = openai_service.evaluate_answer(current_question, submission.answer)
    if openai_evaluation:
        score = openai_evaluation["score"]
        feedback = openai_evaluation["feedback"]
        is_correct = openai_evaluation["is_correct"]
    else:
        score, feedback, is_correct = ai_service.evaluate_answer(current_question, submission.answer)

    # Update session
    answers_given = session.get("answers_given", {})
    answers_given[current_question_id] = submission.answer
    scores = session.get("scores", [])
    scores.append(score)
    total_score = sum(scores) // len(scores) if scores else 0

    consecutive_wrong = session.get("consecutive_wrong_answers", 0)
    if not is_correct:
        consecutive_wrong += 1
    else:
        consecutive_wrong = 0

    # Calculate duration
    start_time = datetime.fromisoformat(session["start_time"])
    duration_minutes = (datetime.now() - start_time).total_seconds() / 60

    # Check if interview should continue
    should_continue = ai_service.should_continue(
        question_count=len(session["questions_asked"]),
        consecutive_wrong=consecutive_wrong,
        duration_minutes=duration_minutes,
        max_duration=session.get("duration_minutes", 15)
    )

    next_question = None
    interview_ended = False
    end_reason = None

    if should_continue:
        # Try OpenAI first, fall back to local service
        next_question = openai_service.generate_interview_question(
            interview_id=interview_id,
            interview_type=session.get("interview_type", "ai"),
            skills=session.get("skills", []),
            projects=session.get("projects", []),
            jd_text=session.get("jd_text", ""),
            question_number=len(session.get("questions_asked", [])) + 1,
            previous_questions=[],
            previous_score=score,
        )
        if next_question is None:
            next_question = ai_service.get_next_question(
                session_id=interview_id,
                previous_score=score,
                skills=session.get("skills", []),
                projects=session.get("projects", []),
                interview_type=session.get("interview_type", "ai")
            )

        if next_question:
            questions_asked = session.get("questions_asked", [])
            questions_asked.append(next_question.id)
            db.update_interview_session(interview_id, {
                "questions_asked": questions_asked
            })

            # Store new question in database
            db.create_interview_question({
                "session_id": session["id"],
                "question_id": next_question.id,
                "question_text": next_question.question,
                "difficulty": next_question.difficulty,
                "category": next_question.category
            })
        else:
            interview_ended = True
            end_reason = "No more questions available"
    else:
        interview_ended = True
        if consecutive_wrong >= 3:
            end_reason = "Too many consecutive wrong answers"
        elif duration_minutes >= session.get("duration_minutes", 15):
            end_reason = "Time limit reached"
        else:
            end_reason = "Question limit reached"

    # Update session in database
    update_data = {
        "answers_given": answers_given,
        "scores": scores,
        "total_score": total_score,
        "consecutive_wrong_answers": consecutive_wrong
    }

    if interview_ended:
        status = "completed" if end_reason == "Question limit reached" else "terminated"
        update_data["status"] = status
        update_data["end_time"] = datetime.now().isoformat()

    db.update_interview_session(interview_id, update_data)

    # Store answer in database
    db.create_interview_answer({
        "session_id": session["id"],
        "question_id": current_question_id,
        "answer_text": submission.answer,
        "answer_type": submission.answer_type or "text",
        "transcription": submission.transcription,
        "score": score,
        "feedback": feedback,
        "is_correct": is_correct
    })

    # Save to history if interview ended
    if interview_ended:
        history_data = {
            "session_id": session["id"],
            "interview_id": interview_id,
            "user_id": session["user_id"],
            "interview_type": session.get("interview_type", "ai"),
            "date": session["start_time"],
            "duration_minutes": int(duration_minutes),
            "total_score": total_score,
            "questions_count": len(session["questions_asked"]),
            "status": status
        }
        db.create_session_history(history_data)

    return AnswerResponse(
        score=score,
        feedback=feedback,
        is_correct=is_correct,
        total_score=total_score,
        next_question=next_question,
        interview_ended=interview_ended,
        end_reason=end_reason
    )

@router.get("/interview/session/{interview_id}")
async def get_session(interview_id: str):
    session = db.get_interview_session(interview_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    return {
        "interview_id": session["interview_id"],
        "status": session["status"],
        "questions_asked": len(session["questions_asked"]),
        "total_score": session.get("total_score", 0),
        "consecutive_wrong_answers": session.get("consecutive_wrong_answers", 0),
        "start_time": session["start_time"],
        "end_time": session.get("end_time")
    }

@router.get("/interview/history")
async def get_history():
    user_id = get_user_id()
    history = db.get_user_history(user_id)
    return history

@router.post("/interview/end/{interview_id}")
async def end_interview(interview_id: str):
    session = db.get_interview_session(interview_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    if session.get("status") == "terminated":
        return {"message": "Interview already ended", "session_id": interview_id}

    # Update session
    end_time = datetime.now()
    start_time = datetime.fromisoformat(session["start_time"])
    duration_minutes = (end_time - start_time).total_seconds() / 60

    db.update_interview_session(interview_id, {
        "status": "terminated",
        "end_time": end_time.isoformat()
    })

    # Save to history
    history_data = {
        "session_id": session["id"],
        "interview_id": interview_id,
        "user_id": session["user_id"],
        "interview_type": session.get("interview_type", "ai"),
        "date": session["start_time"],
        "duration_minutes": int(duration_minutes),
        "total_score": session.get("total_score", 0),
        "questions_count": len(session["questions_asked"]),
        "status": "terminated"
    }
    db.create_session_history(history_data)

    return {"message": "Interview ended", "session_id": interview_id}
