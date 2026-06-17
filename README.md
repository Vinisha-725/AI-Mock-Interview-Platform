# AI Interview Platform

A full-stack AI-powered interview platform with Supabase database integration. Built with React (Vite) frontend and FastAPI backend.

## Features

- Resume upload with AI-powered skill extraction (OpenAI + fallback)
- AI-powered adaptive interview questions (OpenAI + fallback)
- Real-time answer scoring with feedback
- Performance reports with strengths/weaknesses
- Candidate and Recruiter dashboards
- **Supabase database persistence** for users, interviews, and history
- **Real-time candidate tracking** for recruiters
- Job description matching and resume analysis

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- npm or yarn

### 1. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API and copy:
   - Project URL
   - anon/public key
   - service_role key
3. Run the SQL queries from `SUPABASE_QUERIES.sql` in the Supabase SQL Editor
4. See `SUPABASE_SETUP.md` for detailed database schema and setup instructions

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create `.env` file with your Supabase credentials:
```bash
cp .env.example .env
```

6. Edit `.env` and add your Supabase credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

7. Run the backend server:
```bash
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Start both the backend and frontend servers (in separate terminals)
2. Open `http://localhost:5173` in your browser
3. Select your role (Candidate or Recruiter) and login
4. As a Candidate:
   - Upload your resume (with optional job description)
   - View AI-generated match score and suggestions
   - Start the interview (DSA, Aptitude, or AI type)
   - Answer adaptive questions with voice or text input
   - View your performance report with feedback
5. As a Recruiter:
   - View all registered candidates in real-time
   - See candidate interview history and scores
   - Track candidate readiness and performance
   - Shortlist and schedule interviews
   - View analytics and top performers

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Resume
- `POST /api/resume/upload` - Upload resume and extract skills (with optional JD)
- `GET /api/resume/profile` - Get candidate profile data

### Interview
- `POST /api/interview/start` - Start interview session
- `POST /api/interview/answer` - Submit answer and get next question
- `GET /api/interview/session/{interview_id}` - Get interview session details
- `GET /api/interview/history` - Get user interview history
- `POST /api/interview/end/{interview_id}` - End interview session

### Recruiter
- `GET /api/recruiter/candidates` - Get all candidates with profiles and interview history
- `GET /api/recruiter/candidates/{candidate_id}` - Get detailed candidate information
- `GET /api/recruiter/analytics` - Get overall recruiter analytics

### Analytics
- `GET /api/report/{id}` - Get interview report

## AI Integration

The platform uses a hybrid AI approach:

### OpenAI Integration (Primary)
- **Resume Analysis**: GPT-4 analyzes resume and job description for match scoring
- **Question Generation**: AI generates contextual interview questions based on resume and JD
- **Answer Evaluation**: AI provides detailed scoring and feedback on answers

### Fallback Local AI
- **Resume Parsing**: Extracts skills, projects, experience from PDF/DOCX
- **Question Selection**: Adaptive difficulty based on previous scores (>70 = hard, >50 = medium, else easy)
- **Answer Scoring**: Keyword matching with length bonus and randomization
- **Report Generation**: Mock strengths and weaknesses based on performance

### Configuration
OpenAI features require `OPENAI_API_KEY` in backend `.env`. If not configured, the system automatically falls back to local AI logic.

## Database

The platform uses **Supabase** (PostgreSQL) for data persistence:

- **Users**: Candidate and recruiter accounts
- **Profiles**: Candidate profiles with skills, projects, experience
- **Interview Sessions**: Complete interview session tracking
- **Questions**: All interview questions with metadata
- **Answers**: User answers with scores and feedback
- **History**: Interview history for analytics

See `SUPABASE_SETUP.md` for complete database schema and setup instructions.

## Future Enhancements

- Implement real authentication (JWT/OAuth)
- Add video/audio recording capabilities
- Implement real-time WebSocket communication
- Add more sophisticated resume parsing
- Enhanced analytics and reporting
- Mobile app development
- Integration with ATS systems

