from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import load_local_env

load_local_env()

from database import db
from routes import analytics, auth, interview, recruiter, resume

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
    if not db.client:
        print("Database not configured. Running with local in-memory fallbacks.")
        return

    try:
        db.client.table("users").select("*").limit(1).execute()
        print("Database connection successful")
    except Exception as exc:
        print(f"Database connection failed: {exc}")


@app.get("/")
async def root():
    return {"message": "AI Interview Platform API", "status": "running"}


@app.get("/health")
async def health():
    if not db.client:
        return {"status": "healthy", "database": "not_configured"}

    try:
        db.client.table("users").select("*").limit(1).execute()
        return {"status": "healthy", "database": "connected"}
    except Exception as exc:
        return {"status": "healthy", "database": "disconnected", "error": str(exc)}
