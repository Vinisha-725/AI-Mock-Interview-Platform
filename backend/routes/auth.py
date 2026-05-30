from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import db
from typing import Optional

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
            "certifications": []
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
