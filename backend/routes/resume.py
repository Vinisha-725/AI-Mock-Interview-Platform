from fastapi import APIRouter, UploadFile, File
from services.resume_parser import resume_parser
from models import ResumeUploadResponse

router = APIRouter()

@router.post("/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    # Read the actual file content
    file_content = await file.read()
    
    # Parse the resume using actual file content
    result = resume_parser.parse_resume(file_content, file.filename)
    
    return result
