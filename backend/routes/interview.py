from fastapi import APIRouter, HTTPException
from models import (
    InterviewStartRequest, InterviewStartResponse, AnswerSubmission, AnswerResponse,
    InterviewSession, SessionHistory, Question
)
from services.ai_service import ai_service
from services.openai_service import openai_service
from datetime import datetime
from typing import Dict

router = APIRouter()

# In-memory storage for interview sessions (in production, use a database)
interview_sessions: Dict[str, InterviewSession] = {}
session_history: Dict[str, SessionHistory] = {}
interview_questions: Dict[str, Dict[str, Question]] = {}

@router.post("/interview/start", response_model=InterviewStartResponse)
async def start_interview(request: InterviewStartRequest):
    interview_id = ai_service.generate_interview_id()
    start_time = datetime.now()
    
    # Create new session
    session = InterviewSession(
        interview_id=interview_id,
        interview_type=request.interview_type,
        skills=request.skills,
        projects=request.projects,
        jd_text=request.jd_text,
        start_time=start_time,
        duration_minutes=15,  # Default 15 minutes
        questions_asked=[],
        answers_given={},
        scores=[],
        consecutive_wrong_answers=0,
        total_score=0,
        status="active"
    )
    
    interview_sessions[interview_id] = session
    interview_questions[interview_id] = {}
    
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
    
    session.questions_asked.append(question.id)
    interview_questions[interview_id][question.id] = question
    
    return InterviewStartResponse(
        interview_id=interview_id,
        question=question,
        duration_minutes=15,
        start_time=start_time.isoformat()
    )

@router.post("/interview/answer", response_model=AnswerResponse)
async def submit_answer(submission: AnswerSubmission):
    interview_id = submission.interview_id
    
    if interview_id not in interview_sessions:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    session = interview_sessions[interview_id]
    
    if session.status != "active":
        raise HTTPException(status_code=400, detail="Interview is not active")
    
    # Find the actual question being answered so scoring uses the right category.
    current_question_id = submission.question_id or session.questions_asked[-1]
    current_question = interview_questions.get(interview_id, {}).get(current_question_id)
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
    session.answers_given[current_question_id] = submission.answer
    session.scores.append(score)
    session.total_score = sum(session.scores) // len(session.scores) if session.scores else 0
    
    if not is_correct:
        session.consecutive_wrong_answers += 1
    else:
        session.consecutive_wrong_answers = 0
    
    # Calculate duration
    duration_minutes = (datetime.now() - session.start_time).total_seconds() / 60
    
    # Check if interview should continue
    should_continue = ai_service.should_continue(
        question_count=len(session.questions_asked),
        consecutive_wrong=session.consecutive_wrong_answers,
        duration_minutes=duration_minutes,
        max_duration=session.duration_minutes
    )
    
    next_question = None
    interview_ended = False
    end_reason = None
    
    if should_continue:
        previous_question_texts = [
            interview_questions[interview_id][question_id].question
            for question_id in session.questions_asked
            if question_id in interview_questions.get(interview_id, {})
        ]
        next_question = openai_service.generate_interview_question(
            interview_id=interview_id,
            interview_type=session.interview_type,
            skills=session.skills,
            projects=session.projects,
            jd_text=session.jd_text,
            question_number=len(session.questions_asked) + 1,
            previous_questions=previous_question_texts,
            previous_score=score,
        )
        if next_question is None:
            next_question = ai_service.get_next_question(
                session_id=interview_id,
                previous_score=score,
                skills=session.skills,
                projects=session.projects,
                interview_type=session.interview_type
            )
        
        if next_question:
            session.questions_asked.append(next_question.id)
            interview_questions[interview_id][next_question.id] = next_question
        else:
            interview_ended = True
            end_reason = "No more questions available"
    else:
        interview_ended = True
        if session.consecutive_wrong_answers >= 3:
            end_reason = "Too many consecutive wrong answers"
        elif duration_minutes >= session.duration_minutes:
            end_reason = "Time limit reached"
        else:
            end_reason = "Question limit reached"
    
    if interview_ended:
        session.status = "completed" if end_reason == "Question limit reached" else "terminated"
        session.end_time = datetime.now()
        
        # Save to history
        history = SessionHistory(
            session_id=interview_id,
            interview_type=session.interview_type,
            date=session.start_time,
            duration_minutes=int(duration_minutes),
            total_score=session.total_score,
            questions_count=len(session.questions_asked),
            status=session.status
        )
        session_history[interview_id] = history
    
    return AnswerResponse(
        score=score,
        feedback=feedback,
        is_correct=is_correct,
        total_score=session.total_score,
        next_question=next_question,
        interview_ended=interview_ended,
        end_reason=end_reason
    )

@router.get("/interview/session/{interview_id}")
async def get_session(interview_id: str):
    if interview_id not in interview_sessions:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    session = interview_sessions[interview_id]
    return {
        "interview_id": session.interview_id,
        "status": session.status,
        "questions_asked": len(session.questions_asked),
        "total_score": session.total_score,
        "consecutive_wrong_answers": session.consecutive_wrong_answers,
        "start_time": session.start_time.isoformat(),
        "end_time": session.end_time.isoformat() if session.end_time else None
    }

@router.get("/interview/history")
async def get_history():
    return list(session_history.values())

@router.post("/interview/end/{interview_id}")
async def end_interview(interview_id: str):
    if interview_id not in interview_sessions:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    session = interview_sessions[interview_id]
    session.status = "terminated"
    session.end_time = datetime.now()
    
    # Save to history
    duration_minutes = (session.end_time - session.start_time).total_seconds() / 60
    history = SessionHistory(
        session_id=interview_id,
        interview_type=session.interview_type,
        date=session.start_time,
        duration_minutes=int(duration_minutes),
        total_score=session.total_score,
        questions_count=len(session.questions_asked),
        status=session.status
    )
    session_history[interview_id] = history
    
    return {"message": "Interview ended", "session_id": interview_id}
