# Supabase Database Schema for AI Mock Interview Platform

## Database Design

### Tables

#### 1. `users` - Stores both candidates and recruiters
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('candidate', 'recruiter')),
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### 2. `candidate_profiles` - Candidate-specific data
```sql
CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resume_text TEXT,
  skills JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_candidate_profiles_user_id ON candidate_profiles(user_id);
```

#### 3. `recruiter_profiles` - Recruiter-specific data
```sql
CREATE TABLE recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  company_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_recruiter_profiles_user_id ON recruiter_profiles(user_id);
```

#### 4. `job_descriptions` - Job descriptions posted by recruiters
```sql
CREATE TABLE job_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  required_skills JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_descriptions_recruiter_id ON job_descriptions(recruiter_id);
```

#### 5. `interview_sessions` - Interview sessions
```sql
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interview_type VARCHAR(50) NOT NULL CHECK (interview_type IN ('ai', 'dsa', 'aptitude')),
  skills JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  jd_text TEXT,
  company_name VARCHAR(255),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 15,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
  questions_asked JSONB DEFAULT '[]',
  answers_given JSONB DEFAULT '{}',
  scores JSONB DEFAULT '[]',
  consecutive_wrong_answers INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_interview_id ON interview_sessions(interview_id);
CREATE INDEX idx_interview_sessions_status ON interview_sessions(status);
```

#### 6. `session_history` - Historical interview data for analytics
```sql
CREATE TABLE session_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  interview_id VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  interview_type VARCHAR(50) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  questions_count INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_session_history_user_id ON session_history(user_id);
CREATE INDEX idx_session_history_date ON session_history(date);
```

#### 7. `interview_questions` - Questions asked during interviews
```sql
CREATE TABLE interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question_id VARCHAR(100) NOT NULL,
  question_text TEXT NOT NULL,
  difficulty VARCHAR(50),
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interview_questions_session_id ON interview_questions(session_id);
```

#### 8. `interview_answers` - Answers given during interviews
```sql
CREATE TABLE interview_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question_id VARCHAR(100) NOT NULL,
  answer_text TEXT NOT NULL,
  answer_type VARCHAR(50) CHECK (answer_type IN ('text', 'voice')),
  transcription TEXT,
  score INTEGER,
  feedback TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interview_answers_session_id ON interview_answers(session_id);
```

## Setup Instructions

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Choose a name (e.g., "ai-mock-interview")
4. Choose a database password (save it securely)
5. Choose a region closest to your users
6. Click "Create new project"

### 2. Get Credentials
1. Go to Project Settings → API
2. Copy:
   - Project URL
   - anon public key
   - service_role key (for backend admin access)

### 3. Create Tables
You can either:
- Use the SQL Editor in Supabase Dashboard to run the SQL above
- Or use the Supabase CLI to migrate

### 4. Enable Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;

-- Policies for users (simplified for development)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Policies for candidate profiles
CREATE POLICY "Candidates can view own profile" ON candidate_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Candidates can update own profile" ON candidate_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Policies for interview sessions
CREATE POLICY "Users can view own sessions" ON interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON interview_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Policies for session history
CREATE POLICY "Users can view own history" ON session_history FOR SELECT USING (auth.uid() = user_id);
```

## Environment Variables

Add these to your `.env` file in the backend:

```env
SUPABASE_URL=your-project-url
SUPABASE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

## Data Relationships

- `users` table is the central table
- `candidate_profiles` and `recruiter_profiles` are linked to `users` via `user_id`
- `interview_sessions` are linked to `users` (both candidates and recruiters can have sessions)
- `session_history` is a denormalized view for analytics
- `interview_questions` and `interview_answers` are detailed records per session

## Connecting Candidate and Recruiter Data

For final display, you can join tables like:

```sql
-- Get candidate interview history with recruiter info
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

This allows you to:
- Track which candidates took which interviews
- See recruiter activity and candidate performance
- Generate reports combining both datasets
