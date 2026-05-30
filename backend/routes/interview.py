from datetime import datetime
from typing import Dict

from fastapi import APIRouter, HTTPException

from database import db
from models import (
    AnswerResponse,
    AnswerSubmission,
    InterviewSession,
    InterviewStartRequest,
    InterviewStartResponse,
    Question,
    SessionHistory,
)
from services.ai_service import ai_service
from services.openai_service import openai_service

router = APIRouter()

interview_sessions: Dict[str, InterviewSession] = {}
session_history: Dict[str, SessionHistory] = {}
interview_questions: Dict[str, Dict[str, Question]] = {}


def get_user_id() -> str:
    return "00000000-0000-0000-0000-000000000000"


def persist_session(session: InterviewSession) -> None:
    if not db.client:
        return
    try:
        payload = session.model_dump()
        payload["user_id"] = get_user_id()
        payload["start_time"] = session.start_time.isoformat()
        payload["end_time"] = session.end_time.isoformat() if session.end_time else None
        payload["projects"] = [project.model_dump() for project in session.projects]
        if db.get_interview_session(session.interview_id):
            db.update_interview_session(session.interview_id, payload)
        else:
            db.create_interview_session(payload)
    except Exception as exc:
        print(f"Could not persist interview session: {exc}")


def persist_question(interview_id: str, question: Question) -> None:
    if not db.client:
        return
    try:
        session_record = db.get_interview_session(interview_id)
        if not session_record:
            return
        db.create_interview_question({
            "session_id": session_record["id"],
            "question_id": question.id,
            "question_text": question.question,
            "difficulty": question.difficulty,
            "category": question.category,
        })
    except Exception as exc:
        print(f"Could not persist interview question: {exc}")


@router.post("/interview/start", response_model=InterviewStartResponse)
async def start_interview(request: InterviewStartRequest):
    interview_id = ai_service.generate_interview_id()
    start_time = datetime.now()

    session = InterviewSession(
        interview_id=interview_id,
        interview_type=request.interview_type,
        skills=request.skills,
        projects=request.projects,
        jd_text=request.jd_text,
        start_time=start_time,
        duration_minutes=15,
        questions_asked=[],
        answers_given={},
        scores=[],
        consecutive_wrong_answers=0,
        total_score=0,
        status="active",
    )

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
        raise HTTPException(
            status_code=503,
            detail=openai_service.get_last_error() or "AI could not generate an interview question.",
        )

    session.questions_asked.append(question.id)
    interview_sessions[interview_id] = session
    interview_questions[interview_id] = {question.id: question}
    persist_session(session)
    persist_question(interview_id, question)

    return InterviewStartResponse(
        interview_id=interview_id,
        question=question,
        duration_minutes=session.duration_minutes,
        start_time=start_time.isoformat(),
    )


@router.post("/interview/answer", response_model=AnswerResponse)
async def submit_answer(submission: AnswerSubmission):
    interview_id = submission.interview_id
    session = interview_sessions.get(interview_id)

    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    if session.status != "active":
        raise HTTPException(status_code=400, detail="Interview is not active")

    current_question_id = submission.question_id or session.questions_asked[-1]
    current_question = interview_questions.get(interview_id, {}).get(current_question_id)
    if current_question is None:
        raise HTTPException(status_code=400, detail="Question not found for this interview session")

    openai_evaluation = openai_service.evaluate_answer(current_question, submission.answer)
    if openai_evaluation:
        score = openai_evaluation["score"]
        feedback = openai_evaluation["feedback"]
        is_correct = openai_evaluation["is_correct"]
    else:
        score, feedback, is_correct = ai_service.evaluate_answer(current_question, submission.answer)

    session.answers_given[current_question_id] = submission.answer
    session.scores.append(score)
    session.total_score = sum(session.scores) // len(session.scores) if session.scores else 0
    session.consecutive_wrong_answers = session.consecutive_wrong_answers + 1 if not is_correct else 0

    duration_minutes = (datetime.now() - session.start_time).total_seconds() / 60
    should_continue = ai_service.should_continue(
        question_count=len(session.questions_asked),
        consecutive_wrong=session.consecutive_wrong_answers,
        duration_minutes=duration_minutes,
        max_duration=session.duration_minutes,
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
            raise HTTPException(
                status_code=503,
                detail=openai_service.get_last_error() or "AI could not generate the next interview question.",
            )

        session.questions_asked.append(next_question.id)
        interview_questions[interview_id][next_question.id] = next_question
        persist_question(interview_id, next_question)
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
        history = SessionHistory(
            session_id=interview_id,
            interview_type=session.interview_type,
            date=session.start_time,
            duration_minutes=int(duration_minutes),
            total_score=session.total_score,
            questions_count=len(session.questions_asked),
            status=session.status,
        )
        session_history[interview_id] = history

    persist_session(session)

    if db.client:
        try:
            session_record = db.get_interview_session(interview_id)
            if session_record:
                db.create_interview_answer({
                    "session_id": session_record["id"],
                    "question_id": current_question_id,
                    "answer_text": submission.answer,
                    "answer_type": submission.answer_type or "text",
                    "transcription": submission.transcription,
                    "score": score,
                    "feedback": feedback,
                    "is_correct": is_correct,
                })
        except Exception as exc:
            print(f"Could not persist interview answer: {exc}")

    return AnswerResponse(
        score=score,
        feedback=feedback,
        is_correct=is_correct,
        total_score=session.total_score,
        next_question=next_question,
        interview_ended=interview_ended,
        end_reason=end_reason,
    )


@router.get("/interview/session/{interview_id}")
async def get_session(interview_id: str):
    session = interview_sessions.get(interview_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    return {
        "interview_id": session.interview_id,
        "status": session.status,
        "questions_asked": len(session.questions_asked),
        "total_score": session.total_score,
        "consecutive_wrong_answers": session.consecutive_wrong_answers,
        "start_time": session.start_time.isoformat(),
        "end_time": session.end_time.isoformat() if session.end_time else None,
    }


@router.get("/interview/history")
async def get_history():
    return list(session_history.values())


@router.post("/interview/end/{interview_id}")
async def end_interview(interview_id: str):
    session = interview_sessions.get(interview_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    session.status = "terminated"
    session.end_time = datetime.now()
    duration_minutes = (session.end_time - session.start_time).total_seconds() / 60
    session_history[interview_id] = SessionHistory(
        session_id=interview_id,
        interview_type=session.interview_type,
        date=session.start_time,
        duration_minutes=int(duration_minutes),
        total_score=session.total_score,
        questions_count=len(session.questions_asked),
        status=session.status,
    )
    persist_session(session)
    return {"message": "Interview ended", "session_id": interview_id}
