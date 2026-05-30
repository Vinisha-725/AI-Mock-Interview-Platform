from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import load_local_env

load_local_env()

from routes import auth, resume, interview, analytics

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

@app.get("/")
async def root():
    return {"message": "AI Interview Platform API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
