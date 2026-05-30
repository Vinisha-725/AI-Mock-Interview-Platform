from fastapi import APIRouter, HTTPException, UploadFile, File
from services.resume_parser import resume_parser
from models import ResumeUploadResponse

router = APIRouter()

@router.post("/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    filename = file.filename or ""
    filename_lower = filename.lower()
    if not filename_lower.endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a PDF or DOCX resume.")

    # Read the actual file content
    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="Uploaded resume is empty.")
    
    # Parse the resume using actual file content
    try:
        result = resume_parser.parse_resume(file_content, filename)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    
    return result
