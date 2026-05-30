from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from services.resume_parser import resume_parser
from services.openai_service import openai_service
from models import ResumeUploadResponse
from database import db
from typing import Optional

router = APIRouter()

def get_user_id() -> str:
    # TODO: Replace with actual authentication
    return "00000000-0000-0000-0000-000000000000"

@router.post("/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    jd_text: str = Form(""),
    jd_file: Optional[UploadFile] = File(None),
):
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
        job_description = jd_text
        if jd_file and jd_file.filename:
            jd_content = await jd_file.read()
            if jd_content:
                job_description = resume_parser.extract_text(jd_content, jd_file.filename) or job_description

        ai_analysis = openai_service.analyze_resume(result, job_description)
        result = result.model_copy(update=ai_analysis)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    # Save parsed data to Supabase
    user_id = get_user_id()
    candidate_profile = db.get_candidate_profile(user_id)

    if candidate_profile:
        # Update existing profile
        db.update_candidate_profile(user_id, {
            "resume_text": result.get("text", ""),
            "skills": result.get("skills", []),
            "projects": result.get("projects", []),
            "experience": result.get("experience", []),
            "education": result.get("education", []),
            "certifications": result.get("certifications", [])
        })
    else:
        # Create new profile
        db.create_candidate_profile({
            "user_id": user_id,
            "resume_text": result.get("text", ""),
            "skills": result.get("skills", []),
            "projects": result.get("projects", []),
            "experience": result.get("experience", []),
            "education": result.get("education", []),
            "certifications": result.get("certifications", [])
        })

    return result

@router.get("/resume/profile")
async def get_candidate_profile():
    user_id = get_user_id()
    profile = db.get_candidate_profile(user_id)

    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    return {
        "skills": profile.get("skills", []),
        "projects": profile.get("projects", []),
        "experience": profile.get("experience", []),
        "education": profile.get("education", []),
        "certifications": profile.get("certifications", [])
    }
