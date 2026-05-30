# Supabase Integration Setup Guide

This guide will help you set up Supabase for the AI Mock Interview Platform.

## Prerequisites
- Python 3.8+ installed
- Node.js 18+ installed
- Supabase account (free tier is sufficient)

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in the details:
   - **Name**: `HireAI`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the region closest to you
4. Click "Create new project"
5. Wait 1-2 minutes for the project to be ready

## Step 2: Get Your Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxx.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Create Database Tables

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open the file `SUPABASE_QUERIES.sql` from your project root
4. Copy all the SQL queries
5. Paste them into the SQL Editor
6. Click "Run" (or press Ctrl+Enter)

This will create:
- `users` table (for both candidates and recruiters)
- `candidate_profiles` table
- `recruiter_profiles` table
- `job_descriptions` table
- `interview_sessions` table
- `session_history` table
- `interview_questions` table
- `interview_answers` table
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

## Step 4: Set Up Backend Environment Variables

1. Navigate to the `backend` folder
2. Create a file named `.env` (if it doesn't exist)
3. Copy the content from `.env.example`
4. Replace the placeholder values with your actual Supabase credentials:

```env
SUPABASE_URL=https://your-project-url.supabase.co
SUPABASE_KEY=your-service-role-key-here
```

**Important**: Use the `service_role key` for the backend (not the `anon key`), as it has full access to the database.

## Step 5: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `supabase` - Supabase Python client
- `python-dotenv` - For loading environment variables
- Other existing dependencies

## Step 6: Test the Backend

1. Start the backend server:
```bash
cd backend
python -m uvicorn main:app --reload
```

2. Check the console output. You should see:
```
✅ Database connection successful
```

If you see a connection error, double-check your `.env` file and Supabase credentials.

3. Test the health endpoint:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

## Step 7: Test Authentication

1. Register a new user:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "role": "candidate"
  }'
```

2. Login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "password123"
  }'
```

## Step 8: Test Resume Upload

1. Upload a resume:
```bash
curl -X POST http://localhost:8000/api/resume/upload \
  -F "file=@/path/to/your/resume.pdf"
```

2. Get candidate profile:
```bash
curl http://localhost:8000/api/resume/profile
```

## Step 9: Test Interview Flow

1. Start an interview:
```bash
curl -X POST http://localhost:8000/api/interview/start \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Python", "React"],
    "projects": [],
    "jd_text": "",
    "interview_type": "ai"
  }'
```

2. Submit an answer:
```bash
curl -X POST http://localhost:8000/api/interview/answer \
  -H "Content-Type: application/json" \
  -d '{
    "interview_id": "interview_xxx",
    "question_id": "tech_1",
    "answer": "This is my answer",
    "answer_type": "text"
  }'
```

3. Get interview history:
```bash
curl http://localhost:8000/api/interview/history
```

## Database Schema Overview

### Users Table
- Stores both candidates and recruiters
- Linked to candidate_profiles or recruiter_profiles via user_id
- Role field determines which profile table to use

### Candidate Profiles
- Stores resume text, skills, projects, experience, education, certifications
- One-to-one relationship with users table

### Recruiter Profiles
- Stores company name and description
- One-to-one relationship with users table

### Interview Sessions
- Stores active interview sessions
- Tracks questions asked, answers given, scores, status
- Links to users table

### Session History
- Historical data for analytics
- Denormalized for faster queries
- Used for dashboard statistics

### Interview Questions
- Detailed records of questions asked per session
- Links to interview_sessions table

### Interview Answers
- Detailed records of answers given per session
- Includes score, feedback, transcription
- Links to interview_sessions table

## Connecting Candidate and Recruiter Data

To get combined data for reports:

```sql
-- Get candidate performance with recruiter info
SELECT 
  u.full_name as candidate_name,
  u.email as candidate_email,
  is.interview_type,
  is.total_score,
  is.status,
  is.start_time,
  rp.company_name
FROM interview_sessions is
JOIN users u ON is.user_id = u.id
LEFT JOIN recruiter_profiles rp ON u.id = rp.user_id
WHERE u.role = 'candidate'
ORDER BY is.start_time DESC;
```

## Next Steps

1. **Implement proper authentication**: Currently using a mock user ID. Implement JWT tokens or session-based auth.
2. **Add password hashing**: Use bcrypt or similar to hash passwords before storing.
3. **Add file storage**: Use Supabase Storage to store actual resume files.
4. **Add email verification**: Implement email verification for user registration.
5. **Add rate limiting**: Protect your API from abuse.

## Troubleshooting

### Database Connection Failed
- Check your `.env` file has correct values
- Verify your Supabase project is active
- Ensure you're using the `service_role key`, not the `anon key`

### Permission Denied Errors
- Check RLS policies in Supabase Dashboard
- Ensure the service_role key has proper permissions
- Verify table relationships are correct

### CORS Errors
- Check your frontend is running on the allowed origin (http://localhost:5173)
- Verify CORS configuration in main.py

## Files Created/Modified

### Created:
- `SUPABASE_SETUP.md` - Database schema documentation
- `SUPABASE_QUERIES.sql` - SQL queries to run in Supabase
- `backend/database.py` - Supabase client and helper functions
- `backend/.env.example` - Environment variable template
- `SUPABASE_INTEGRATION_GUIDE.md` - This file

### Modified:
- `backend/requirements.txt` - Added supabase and python-dotenv
- `backend/routes/interview.py` - Updated to use Supabase
- `backend/routes/auth.py` - Updated to use Supabase
- `backend/routes/resume.py` - Updated to use Supabase
- `backend/main.py` - Added database connection check

## Support

If you encounter issues:
1. Check the Supabase Dashboard for error logs
2. Verify your database tables were created correctly
3. Test your Supabase connection using the SQL Editor
4. Check the backend console for error messages
