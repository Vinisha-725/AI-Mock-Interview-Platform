from datetime import datetime, timezone
from typing import Dict

from fastapi import APIRouter, HTTPException, UploadFile, File
import tempfile
import os

from database import db
from models import (
    AnswerResponse,
    AnswerSubmission,
    InterviewSession,
    InterviewStartRequest,
    InterviewStartResponse,
    Question,
    SessionHistory,
    DSATestCase,
    DSAQuestion,
    DSARunRequest,
    DSASubmissionRequest,
)
from services.ai_service import ai_service

from services.openai_service import openai_service

router = APIRouter()

interview_sessions: Dict[str, InterviewSession] = {}
session_history: Dict[str, SessionHistory] = {}
interview_questions: Dict[str, Dict[str, Question]] = {}





def persist_session(session: InterviewSession) -> None:
    if not db.client:
        return
    try:
        payload = session.model_dump()
        payload["user_id"] = session.user_id
        payload["start_time"] = session.start_time.isoformat()
        payload["end_time"] = session.end_time.isoformat() if session.end_time else None
        payload["projects"] = [project.model_dump() for project in session.projects]
        payload.pop("dsa_questions", None)  # Not stored directly in interview_sessions table
        if db.get_interview_session(session.interview_id):
            db.update_interview_session(session.interview_id, payload)
        else:
            db.create_interview_session(payload)
    except Exception as exc:
        print(f"Could not persist interview session: {exc}")


def persist_history(history: SessionHistory) -> None:
    if not db.client:
        return
    try:
        session_record = db.get_interview_session(history.session_id)
        if not session_record:
            return
            
        payload = history.model_dump(mode="json")
        payload["interview_id"] = history.session_id
        payload["session_id"] = session_record["id"]
        
        # Check if we already have this history
        existing = db.client.table("session_history").select("*").eq("interview_id", history.session_id).execute()
        if existing.data:
            db.update_session_history(history.session_id, payload)
        else:
            db.create_session_history(payload)
    except Exception as exc:
        print(f"Could not persist session history: {exc}")


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
    start_time = datetime.now(timezone.utc)

    # If it is a DSA coding challenge, it gets exactly 1 hour (60 mins)
    duration_mins = 60 if request.interview_type == "dsa" else 15

    session = InterviewSession(
        interview_id=interview_id,
        user_id=request.user_id,
        interview_type=request.interview_type,
        skills=request.skills,
        projects=request.projects,
        jd_text=request.jd_text,
        company_name=request.company_name,
        start_time=datetime.now(timezone.utc),
        duration_minutes=duration_mins,
        questions_asked=[],
        answers_given={},
        scores=[],
        consecutive_wrong_answers=0,
        total_score=0,
        status="active",
    )

    if request.interview_type == "dsa":
        # Generate 5 dynamic unique coding challenges
        dsa_qs = openai_service.generate_dsa_questions(request.skills)
        session.dsa_questions = dsa_qs
        interview_sessions[interview_id] = session
        persist_session(session)
        
        return InterviewStartResponse(
            interview_id=interview_id,
            question=None,
            duration_minutes=duration_mins,
            start_time=start_time.isoformat(),
            dsa_questions=dsa_qs
        )

    # Standard AI / Aptitude Interview Generation
    question = openai_service.generate_interview_question(
        interview_id=interview_id,
        interview_type=request.interview_type,
        skills=request.skills,
        projects=request.projects,
        jd_text=request.jd_text,
        question_number=1,
        previous_questions=[],
    )
    
    # Graceful Fallback if LLM is unavailable: use local personalized template questions!
    if question is None:
        question = ai_service.get_first_question(
            skills=request.skills,
            projects=request.projects,
            jd_text=request.jd_text,
            interview_type=request.interview_type,
            session_id=interview_id
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

    duration_minutes = (datetime.now(timezone.utc) - session.start_time).total_seconds() / 60
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
        # Graceful Fallback if LLM is unavailable: use local personalized template questions!
        if next_question is None:
            next_question = ai_service.get_next_question(
                session_id=interview_id,
                previous_score=score,
                skills=session.skills,
                projects=session.projects,
                interview_type=session.interview_type
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
        session.end_time = datetime.now(timezone.utc)
        history = SessionHistory(
            session_id=interview_id,
            user_id=session.user_id,
            company_name=session.company_name,
            interview_type=session.interview_type,
            date=session.start_time,
            duration_minutes=int(duration_minutes),
            total_score=session.total_score,
            questions_count=len(session.questions_asked),
            status=session.status,
        )
        session_history[interview_id] = history
        persist_history(history)

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
    if db.client:
        try:
            user_id = get_user_id()
            history = db.get_user_history(user_id)
            return history if history else []
        except Exception as exc:
            print(f"Could not fetch history from database: {exc}")
            return list(session_history.values())
    return list(session_history.values())


@router.post("/interview/end/{interview_id}")
async def end_interview(interview_id: str):
    session = interview_sessions.get(interview_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    session.status = "terminated"
    session.end_time = datetime.now(timezone.utc)
    duration_minutes = (session.end_time - session.start_time).total_seconds() / 60
    history = SessionHistory(
        session_id=interview_id,
        user_id=session.user_id,
        company_name=session.company_name,
        interview_type=session.interview_type,
        date=session.start_time,
        duration_minutes=int(duration_minutes),
        total_score=session.total_score,
        questions_count=len(session.questions_asked),
        status=session.status,
    )
    session_history[interview_id] = history
    persist_history(history)
    persist_session(session)
    return {"message": "Interview ended", "session_id": interview_id}


@router.post("/interview/dsa/run")
async def run_dsa_code(req: DSARunRequest):
    session = interview_sessions.get(req.interview_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    if session.status != "active":
        raise HTTPException(status_code=400, detail="Interview session is not active")

    if not session.dsa_questions:
        raise HTTPException(status_code=400, detail="No DSA questions found in this session")

    # Find the question
    question = next((q for q in session.dsa_questions if q.id == req.question_id), None)
    if not question:
        raise HTTPException(status_code=400, detail="DSA Question not found")

    # Run the code locally
    updated_cases = openai_service.run_local_python_code(req.code, question.test_cases, question.title)
    return {"test_cases": [tc.model_dump() for tc in updated_cases]}


@router.post("/interview/dsa/submit")
async def submit_dsa_solution(req: DSASubmissionRequest):
    session = interview_sessions.get(req.interview_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    if session.status != "active":
        raise HTTPException(status_code=400, detail="Interview session is not active")

    if not session.dsa_questions:
        raise HTTPException(status_code=400, detail="No DSA questions found in this session")

    # Find index of the question
    q_index = next((i for i, q in enumerate(session.dsa_questions) if q.id == req.question_id), None)
    if q_index is None:
        raise HTTPException(status_code=400, detail="DSA Question not found")

    question = session.dsa_questions[q_index]

    # Evaluate the code
    eval_res = openai_service.evaluate_dsa_code(question, req.language, req.code)

    # Convert test cases dict to DSATestCase objects
    parsed_cases = [DSATestCase(**tc) for tc in eval_res["test_cases"]]

    # Update question state
    question.user_code = req.code
    question.selected_language = req.language
    question.status = "passed" if eval_res["is_correct"] else "failed"
    question.score = eval_res["score"]
    question.feedback = eval_res["feedback"]
    question.test_cases = parsed_cases

    # Re-calculate overall session score
    solved_scores = [q.score for q in session.dsa_questions if q.score is not None]
    if solved_scores:
        session.total_score = sum(solved_scores) // len(session.dsa_questions)

    # Persist session
    persist_session(session)

    # Check if all 5 questions are solved
    all_solved = all(q.status in {"passed", "failed"} for q in session.dsa_questions)
    
    interview_ended = False
    end_reason = None
    
    if all_solved:
        interview_ended = True
        end_reason = "All questions attempted"
        session.status = "completed"
        session.end_time = datetime.now(timezone.utc)
        
        # Save to history
        duration_minutes = (session.end_time - session.start_time).total_seconds() / 60
        history = SessionHistory(
            session_id=req.interview_id,
            user_id=session.user_id,
            company_name=session.company_name,
            interview_type=session.interview_type,
            date=session.start_time,
            duration_minutes=int(duration_minutes),
            total_score=session.total_score,
            questions_count=len(session.dsa_questions),
            status=session.status,
        )
        session_history[req.interview_id] = history
        persist_history(history)
        persist_session(session)

    return {
        "score": eval_res["score"],
        "feedback": eval_res["feedback"],
        "is_correct": eval_res["is_correct"],
        "total_score": session.total_score,
        "test_cases": eval_res["test_cases"],
        "interview_ended": interview_ended,
        "end_reason": end_reason
    }
@router.post("/interview/transcribe")
async def transcribe_audio_endpoint(audio: UploadFile = File(...)):
    """Transcribe an uploaded audio file using Whisper API"""
    try:
        content = await audio.read()
        suffix = os.path.splitext(audio.filename)[1] if audio.filename else ".webm"
        if not suffix:
            suffix = ".webm"
            
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        try:
            transcript = openai_service.transcribe_audio(tmp_path)
        finally:
            os.remove(tmp_path)

        if transcript is None:
            raise HTTPException(status_code=500, detail=openai_service.get_last_error() or "Transcription failed")
            
        return {"text": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
