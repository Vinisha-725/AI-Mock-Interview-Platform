from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import db
from typing import Optional, List, Dict

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: str  # "candidate" or "recruiter"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    role: str
    created_at: str

class CandidateProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    target_role: Optional[str] = None
    resume_text: Optional[str] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[Dict]] = None
    experience: Optional[List[Dict]] = None
    education: Optional[List[Dict]] = None
    certifications: Optional[List[str]] = None

@router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    # Check if user already exists
    existing_user = db.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Create user
    # Note: In production, you should hash the password using bcrypt or similar
    user_dict = {
        "email": user_data.email,
        "password_hash": user_data.password,  # TODO: Hash this in production
        "full_name": user_data.full_name,
        "role": user_data.role
    }

    user = db.create_user(user_dict)
    if not user:
        raise HTTPException(status_code=500, detail="Failed to create user")

    # Create profile based on role
    if user_data.role == "candidate":
        db.create_candidate_profile({
            "user_id": user["id"],
            "resume_text": "",
            "skills": [],
            "projects": [],
            "experience": [],
            "education": [],
            "certifications": [],
            "target_role": ""
        })
    elif user_data.role == "recruiter":
        db.create_recruiter_profile({
            "user_id": user["id"],
            "company_name": "",
            "company_description": ""
        })

    return UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user.get("full_name"),
        role=user["role"],
        created_at=user["created_at"]
    )

@router.post("/auth/login")
async def login(credentials: UserLogin):
    user = db.get_user_by_email(credentials.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Note: In production, verify password hash
    if user["password_hash"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Return user data (in production, return a JWT token)
    return {
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user.get("full_name"),
            "role": user["role"]
        },
        "message": "Login successful"
    }

@router.get("/auth/status")
async def auth_status():
    return {"status": "authenticated", "message": "Mock authentication - no real auth required"}

@router.put("/auth/candidate/profile")
async def update_candidate_profile(profile_data: CandidateProfileUpdate):
    """Update candidate profile with their details"""
    try:
        # Get current user (mock - in production, get from JWT token)
        user_id = "00000000-0000-0000-0000-000000000000"

        # Update user's full_name if provided
        if profile_data.full_name:
            db.update_user(user_id, {"full_name": profile_data.full_name})

        # Build profile update dict
        profile_update = {}
        if profile_data.target_role is not None:
            profile_update["target_role"] = profile_data.target_role
        if profile_data.resume_text is not None:
            profile_update["resume_text"] = profile_data.resume_text
        if profile_data.skills is not None:
            profile_update["skills"] = profile_data.skills
        if profile_data.projects is not None:
            profile_update["projects"] = profile_data.projects
        if profile_data.experience is not None:
            profile_update["experience"] = profile_data.experience
        if profile_data.education is not None:
            profile_update["education"] = profile_data.education
        if profile_data.certifications is not None:
            profile_update["certifications"] = profile_data.certifications

        # Update candidate profile
        if profile_update:
            db.update_candidate_profile(user_id, profile_update)

        # Return updated profile
        profile = db.get_candidate_profile(user_id)
        user = db.client.table('users').select('*').eq('id', user_id).execute()
        user_data = user.data[0] if user.data else {}

        return {
            "id": user_data.get("id"),
            "email": user_data.get("email"),
            "full_name": user_data.get("full_name"),
            "role": user_data.get("role"),
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.get("/auth/candidate/profile")
async def get_candidate_profile():
    """Get current candidate's profile"""
    try:
        # Get current user (mock - in production, get from JWT token)
        user_id = "00000000-0000-0000-0000-000000000000"

        profile = db.get_candidate_profile(user_id)
        user = db.client.table('users').select('*').eq('id', user_id).execute()
        user_data = user.data[0] if user.data else {}

        return {
            "id": user_data.get("id"),
            "email": user_data.get("email"),
            "full_name": user_data.get("full_name"),
            "role": user_data.get("role"),
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")
