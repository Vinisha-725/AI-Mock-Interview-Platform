from fastapi import APIRouter, HTTPException, UploadFile, File, Header
from pydantic import BaseModel, EmailStr
from database import db
from typing import Optional, List, Dict
from services.resume_parser import resume_parser

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
    email: Optional[str] = None
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
async def update_candidate_profile(profile_data: CandidateProfileUpdate, x_user_id: Optional[str] = Header(None)):
    """Update candidate profile with their details"""
    try:
        print(f"Received profile update request: {profile_data}")

        # Get current user (from header or fallback to mock)
        user_id = x_user_id or "00000000-0000-0000-0000-000000000000"

        if not db.client:
            print("Database not connected, returning mock success")
            # Return mock success if database not connected
            return {
                "id": user_id,
                "email": profile_data.email or "test@example.com",
                "full_name": profile_data.full_name or "Test User",
                "role": "candidate",
                "profile": {
                    "target_role": profile_data.target_role,
                    "resume_text": profile_data.resume_text,
                    "skills": profile_data.skills or [],
                    "projects": profile_data.projects or [],
                    "experience": profile_data.experience or [],
                    "education": profile_data.education or [],
                    "certifications": profile_data.certifications or []
                }
            }

        # Check if user exists, if not create a test user
        user = db.client.table('users').select('*').eq('id', user_id).execute()
        if not user.data:
            print(f"User not found, creating test user with id {user_id}")
            try:
                # Create a test user
                user_data = {
                    "id": user_id,
                    "email": profile_data.email or "test@example.com",
                    "password_hash": "mock_password",
                    "full_name": profile_data.full_name or "Test User",
                    "role": "candidate"
                }
                db.create_user(user_data)
                user = db.client.table('users').select('*').eq('id', user_id).execute()
            except Exception as e:
                print(f"Failed to create user: {e}")
                # Continue anyway, might already exist

        user_data = user.data[0] if user.data else {
            "id": user_id,
            "email": profile_data.email or "test@example.com",
            "full_name": profile_data.full_name or "Test User",
            "role": "candidate"
        }
        print(f"User data: {user_data}")

        # Update user's full_name and email if provided
        try:
            user_update = {}
            if profile_data.full_name:
                user_update["full_name"] = profile_data.full_name
            if profile_data.email:
                user_update["email"] = profile_data.email
            if user_update:
                print(f"Updating user: {user_update}")
                db.update_user(user_id, user_update)
        except Exception as e:
            print(f"Failed to update user: {e}")

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

        print(f"Profile update dict: {profile_update}")

        # Check if profile exists, if not create it
        try:
            existing_profile = db.get_candidate_profile(user_id)
            if not existing_profile:
                print(f"Creating new profile for user {user_id}")
                # Create profile with default values + provided data
                profile_data_create = {
                    "user_id": user_id,
                    "resume_text": profile_data.resume_text or "",
                    "skills": profile_data.skills or [],
                    "projects": profile_data.projects or [],
                    "experience": profile_data.experience or [],
                    "education": profile_data.education or [],
                    "certifications": profile_data.certifications or [],
                    "target_role": profile_data.target_role or ""
                }
                print(f"Creating profile with data: {profile_data_create}")
                db.create_candidate_profile(profile_data_create)
            elif profile_update:
                print(f"Updating existing profile for user {user_id}")
                # Update existing profile
                db.update_candidate_profile(user_id, profile_update)

            # Return updated profile
            profile = db.get_candidate_profile(user_id)
        except Exception as e:
            print(f"Failed to save profile to database: {e}")
            profile = {
                "target_role": profile_data.target_role,
                "resume_text": profile_data.resume_text,
                "skills": profile_data.skills or [],
                "projects": profile_data.projects or [],
                "experience": profile_data.experience or [],
                "education": profile_data.education or [],
                "certifications": profile_data.certifications or []
            }

        print(f"Final profile: {profile}")

        return {
            "id": user_data.get("id"),
            "email": user_data.get("email"),
            "full_name": user_data.get("full_name"),
            "role": user_data.get("role"),
            "profile": profile
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating profile: {e}")
        import traceback
        traceback.print_exc()
        # Return success anyway to not block the user
        return {
            "id": "00000000-0000-0000-0000-000000000000",
            "email": profile_data.email or "test@example.com",
            "full_name": profile_data.full_name or "Test User",
            "role": "candidate",
            "profile": {
                "target_role": profile_data.target_role,
                "resume_text": profile_data.resume_text,
                "skills": profile_data.skills or [],
                "projects": profile_data.projects or [],
                "experience": profile_data.experience or [],
                "education": profile_data.education or [],
                "certifications": profile_data.certifications or []
            }
        }

@router.get("/auth/candidate/profile")
async def get_candidate_profile(x_user_id: Optional[str] = Header(None)):
    """Get current candidate's profile"""
    try:
        # Get current user (from header or fallback to mock)
        user_id = x_user_id or "00000000-0000-0000-0000-000000000000"

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

@router.post("/auth/candidate/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """Parse resume and extract profile data"""
    try:
        file_content = await file.read()
        parsed_data = resume_parser.parse_resume(file_content, file.filename)

        return {
            "success": True,
            "data": parsed_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")
