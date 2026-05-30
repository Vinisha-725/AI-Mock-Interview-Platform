# AI Interview Platform

A full-stack AI-powered interview platform for hackathon MVP. Built with React (Vite) frontend and FastAPI backend.

## Features

- Resume upload with mock skill extraction
- AI-powered adaptive interview questions
- Real-time answer scoring
- Performance reports with strengths/weaknesses
- Candidate and Recruiter dashboards

## Project Structure

```
ai-powered-interview-platform/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── CandidateDashboard.jsx
│   │   │   ├── RecruiterDashboard.jsx
│   │   │   ├── InterviewRoom.jsx
│   │   │   ├── ResumeUpload.jsx
│   │   │   └── Report.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── Timer.jsx
│   │   │   └── ScoreCard.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── interview.js
│   │   │   └── resume.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── backend/
    ├── main.py
    ├── models.py
    ├── requirements.txt
    ├── routes/
    │   ├── auth.py
    │   ├── resume.py
    │   ├── interview.py
    │   └── analytics.py
    ├── services/
    │   ├── ai_service.py
    │   ├── resume_parser.py
    │   └── scoring.py
    └── utils/
        └── helpers.py
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- npm or yarn

### Backend Setup

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

5. Run the backend server:
```bash
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

### Frontend Setup

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
   - Upload your resume
   - Start the interview
   - Answer adaptive questions
   - View your performance report
5. As a Recruiter:
   - View candidate reports
   - Review interview scores

## API Endpoints

### Resume
- `POST /api/resume/upload` - Upload resume and extract skills

### Interview
- `POST /api/interview/start` - Start interview session
- `POST /api/interview/answer` - Submit answer and get next question

### Analytics
- `GET /api/report/{id}` - Get interview report

### Auth
- `GET /api/auth/status` - Check authentication status

## Mock AI Logic

The platform uses mock AI logic for demonstration:
- **Resume Parsing**: Returns predefined skills based on filename
- **Question Selection**: Adaptive difficulty based on previous scores (>70 = hard, >50 = medium, else easy)
- **Answer Scoring**: Keyword matching with length bonus and randomization
- **Report Generation**: Mock strengths and weaknesses based on performance

## Future Enhancements

- Integrate real LLM for question generation and scoring
- Add database persistence (PostgreSQL/MongoDB)
- Implement real authentication (JWT/OAuth)
- Add video/audio recording capabilities
- Implement real-time WebSocket communication
- Add more sophisticated resume parsing
- Enhanced analytics and reporting

## License

MIT License
