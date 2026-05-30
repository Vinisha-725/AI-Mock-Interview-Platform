from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import load_local_env

load_local_env()

from routes import auth, resume, interview, analytics, recruiter
from database import db

app = FastAPI(title="AI Interview Platform API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(resume.router, prefix="/api", tags=["resume"])
app.include_router(interview.router, prefix="/api", tags=["interview"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(recruiter.router, prefix="/api", tags=["recruiter"])

@app.on_event("startup")
def startup_event():
    # Test database connection
    try:
        db.client.table("users").select("*").limit(1).execute()
        print("✅ Database connection successful")
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        print("Make sure you have set up Supabase and configured environment variables")

@app.get("/")
async def root():
    return {"message": "AI Interview Platform API", "status": "running"}

@app.get("/health")
async def health():
    try:
        db.client.table("users").select("*").limit(1).execute()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "healthy", "database": "disconnected", "error": str(e)}
