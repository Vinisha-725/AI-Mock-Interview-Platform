from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class Project(BaseModel):
    name: str
    description: str
    tech: List[str]


class Experience(BaseModel):
    company: str
    role: str
    duration: str


class Education(BaseModel):
    degree: str
    institution: str
    year: str


class ResumeUploadResponse(BaseModel):
    skills: List[str]
    projects: List[Project]
    experience: List[Experience]
    education: List[Education]
    techStack: List[str]
    certifications: List[str]
    match_score: int = 0
    missing_skills: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    ai_provider: str = "fallback"
    jd_text: str = ""


class Question(BaseModel):
    id: str
    question: str
    difficulty: str
    category: str
    follow_up_to: Optional[str] = None
    source: str = "local"


class DSATestCase(BaseModel):
    id: str
    input: str
    expected_output: str
    actual_output: Optional[str] = None
    passed: Optional[bool] = None


class DSAQuestion(BaseModel):
    id: str
    title: str
    problem_statement: str
    difficulty: str
    code_stubs: Dict[str, str]  # language -> starter stub code
    test_cases: List[DSATestCase]
    user_code: Optional[str] = None
    selected_language: Optional[str] = None
    status: str = "unsolved"  # "unsolved", "passed", "failed"
    feedback: Optional[str] = None
    score: Optional[int] = None


class InterviewStartRequest(BaseModel):
    skills: List[str]
    projects: List[Project]
    jd_text: Optional[str] = None
    interview_type: str = "ai"


class InterviewStartResponse(BaseModel):
    interview_id: str
    question: Optional[Question] = None
    duration_minutes: int
    start_time: str
    dsa_questions: Optional[List[DSAQuestion]] = None



class AnswerSubmission(BaseModel):
    interview_id: str
    question_id: str
    answer: str
    answer_type: str = "text"
    transcription: Optional[str] = None


class AnswerResponse(BaseModel):
    score: int
    feedback: str
    is_correct: bool
    total_score: int
    next_question: Optional[Question] = None
    interview_ended: bool = False
    end_reason: Optional[str] = None


class InterviewSession(BaseModel):
    interview_id: str
    interview_type: str
    skills: List[str]
    projects: List[Project]
    jd_text: Optional[str]
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: int
    questions_asked: List[str]
    answers_given: Dict[str, str]
    scores: List[int]
    consecutive_wrong_answers: int
    total_score: int
    status: str
    dsa_questions: Optional[List[DSAQuestion]] = None



class SessionHistory(BaseModel):
    session_id: str
    interview_type: str
    date: datetime
    duration_minutes: int
    total_score: int
    questions_count: int
    status: str


class Report(BaseModel):
    readiness_score: int
    strengths: List[str]
    weaknesses: List[str]
    question_count: int
    total_score: int

class DSARunRequest(BaseModel):
    interview_id: str
    question_id: str
    language: str
    code: str


class DSASubmissionRequest(BaseModel):
    interview_id: str
    question_id: str
    language: str
    code: str

