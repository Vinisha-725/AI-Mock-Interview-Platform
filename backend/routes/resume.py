from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from database import db
from models import ResumeUploadResponse
from services.openai_service import openai_service
from services.resume_parser import resume_parser

router = APIRouter()


def get_user_id() -> str:
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

    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="Uploaded resume is empty.")

    try:
        result = resume_parser.parse_resume(file_content, filename)
        job_description = jd_text
        if jd_file and jd_file.filename:
            jd_content = await jd_file.read()
            if jd_content:
                job_description = resume_parser.extract_text(jd_content, jd_file.filename) or job_description

        ai_analysis = openai_service.analyze_resume(result, job_description)
        result = result.model_copy(update={**ai_analysis, "jd_text": job_description})
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    if db.client:
        try:
            user_id = get_user_id()
            parsed = result.model_dump()
            profile_data = {
                "resume_text": "",
                "skills": parsed.get("skills", []),
                "projects": parsed.get("projects", []),
                "experience": parsed.get("experience", []),
                "education": parsed.get("education", []),
                "certifications": parsed.get("certifications", []),
            }
            if db.get_candidate_profile(user_id):
                db.update_candidate_profile(user_id, profile_data)
            else:
                db.create_candidate_profile({"user_id": user_id, **profile_data})
        except Exception as exc:
            print(f"Could not save candidate profile to Supabase: {exc}")

    return result


@router.get("/resume/profile")
async def get_candidate_profile():
    if not db.client:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    user_id = get_user_id()
    profile = db.get_candidate_profile(user_id)

    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    return {
        "skills": profile.get("skills", []),
        "projects": profile.get("projects", []),
        "experience": profile.get("experience", []),
        "education": profile.get("education", []),
        "certifications": profile.get("certifications", []),
    }
