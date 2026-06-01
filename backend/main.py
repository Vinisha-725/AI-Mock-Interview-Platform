from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import load_local_env
import os

def log_debug(msg):
    try:
        log_path = r"c:\Users\ASUS\ai-mock\AI-Mock-Interview-Platform\backend\startup.log"
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"[PID {os.getpid()}] {msg}\n")
    except Exception as e:
        print(f"FAILED TO WRITE LOG: {e}", flush=True)

log_debug("--- main.py starting ---")
log_debug(f"Before load_local_env URL: {os.getenv('SUPABASE_URL')}")

load_local_env()

log_debug(f"After load_local_env URL: {os.getenv('SUPABASE_URL')}")
log_debug(f"After load_local_env KEY: {os.getenv('SUPABASE_KEY')}")

from database import db
log_debug(f"After database import db.client: {db.client}")
from routes import analytics, auth, interview, recruiter, resume

app = FastAPI(title="AI Interview Platform API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175", "http://127.0.0.1:5175"],
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
    import os
    print("URL at startup:", os.getenv("SUPABASE_URL"))
    print("KEY at startup:", os.getenv("SUPABASE_KEY"))
    print("db.client at startup:", db.client)
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
        log_debug(f"HEALTH CHECK ERROR: {exc}")
        return {"status": "healthy", "database": "disconnected", "error": str(exc)}
