from fastapi import APIRouter, UploadFile, File
from services.resume_parser import resume_parser
from models import ResumeUploadResponse

router = APIRouter()

@router.post("/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    # Mock resume parsing
    skills = resume_parser.extract_skills(file.filename)
    return ResumeUploadResponse(skills=skills)
