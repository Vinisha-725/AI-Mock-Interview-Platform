from fastapi import APIRouter
from models import InterviewStartRequest, InterviewStartResponse, AnswerSubmission, AnswerResponse
from services.ai_service import ai_service
from services.scoring import scoring_service

router = APIRouter()

# In-memory storage for interview state
interview_state = {}

@router.post("/interview/start", response_model=InterviewStartResponse)
async def start_interview(request: InterviewStartRequest):
    question = ai_service.get_first_question(request.skills)
    interview_id = "interview_1"
    interview_state[interview_id] = {
        "question_count": 0,
        "scores": []
    }
    return InterviewStartResponse(question=question)

@router.post("/interview/answer", response_model=AnswerResponse)
async def submit_answer(submission: AnswerSubmission):
    interview_id = "interview_1"
    
    if interview_id not in interview_state:
        interview_state[interview_id] = {
            "question_count": 0,
            "scores": []
        }
    
    # Score the answer
    score = scoring_service.score_answer(submission.answer, submission.question_id)
    interview_state[interview_id]["scores"].append(score)
    interview_state[interview_id]["question_count"] += 1
    
    # Calculate total score
    total_score = sum(interview_state[interview_id]["scores"]) // len(interview_state[interview_id]["scores"])
    
    # Determine if we should continue
    question_count = interview_state[interview_id]["question_count"]
    if ai_service.should_continue(question_count):
        next_question = ai_service.get_next_question(total_score)
    else:
        next_question = None
    
    return AnswerResponse(
        score=score,
        total_score=total_score,
        next_question=next_question
    )
