from pydantic import BaseModel
from typing import List, Optional

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
