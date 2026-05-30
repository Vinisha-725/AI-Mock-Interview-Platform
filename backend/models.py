from pydantic import BaseModel
from typing import List, Optional

class ResumeUploadResponse(BaseModel):
    skills: List[str]

class InterviewStartRequest(BaseModel):
    skills: List[str]

class Question(BaseModel):
    id: int
    question: str
    difficulty: str

class InterviewStartResponse(BaseModel):
    question: Question

class AnswerSubmission(BaseModel):
    question_id: int
    answer: str
    previous_score: int

class AnswerResponse(BaseModel):
    score: int
    total_score: int
    next_question: Optional[Question] = None

class Report(BaseModel):
    readiness_score: int
    strengths: List[str]
    weaknesses: List[str]
    question_count: int
    total_score: int
