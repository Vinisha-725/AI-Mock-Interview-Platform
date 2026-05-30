-- ============================================
-- SUPABASE DATABASE SETUP FOR AI MOCK INTERVIEW
-- Copy and paste these queries into Supabase SQL Editor
-- ============================================

-- Step 1: Create users table
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

-- Step 2: Create candidate_profiles table
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

-- Step 3: Create recruiter_profiles table
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

-- Step 4: Create job_descriptions table
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

-- Step 5: Create interview_sessions table
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interview_type VARCHAR(50) NOT NULL CHECK (interview_type IN ('ai', 'dsa', 'aptitude')),
  skills JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  jd_text TEXT,
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

-- Step 6: Create session_history table
CREATE TABLE session_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  interview_id VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- Step 7: Create interview_questions table
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

-- Step 8: Create interview_answers table
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

-- Step 9: Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS Policies (for development - you can tighten these later)
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Candidates can view own profile
CREATE POLICY "Candidates can view own profile" ON candidate_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Candidates can update own profile" ON candidate_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Candidates can insert own profile" ON candidate_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recruiters can view own profile
CREATE POLICY "Recruiters can view own profile" ON recruiter_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Recruiters can update own profile" ON recruiter_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Recruiters can insert own profile" ON recruiter_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view own sessions
CREATE POLICY "Users can view own sessions" ON interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON interview_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Users can view own history
CREATE POLICY "Users can view own history" ON session_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON session_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view own questions
CREATE POLICY "Users can view own questions" ON interview_questions FOR SELECT USING (auth.uid() IN (SELECT user_id FROM interview_sessions WHERE id = session_id));
CREATE POLICY "Users can insert own questions" ON interview_questions FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM interview_sessions WHERE id = session_id));

-- Users can view own answers
CREATE POLICY "Users can view own answers" ON interview_answers FOR SELECT USING (auth.uid() IN (SELECT user_id FROM interview_sessions WHERE id = session_id));
CREATE POLICY "Users can insert own answers" ON interview_answers FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM interview_sessions WHERE id = session_id));

-- Recruiters can view own job descriptions
CREATE POLICY "Recruiters can view own job descriptions" ON job_descriptions FOR SELECT USING (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can insert own job descriptions" ON job_descriptions FOR INSERT WITH CHECK (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can update own job descriptions" ON job_descriptions FOR UPDATE USING (auth.uid() = recruiter_id);

-- Step 11: Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 12: Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_profiles_updated_at BEFORE UPDATE ON candidate_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruiter_profiles_updated_at BEFORE UPDATE ON recruiter_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_sessions_updated_at BEFORE UPDATE ON interview_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_descriptions_updated_at BEFORE UPDATE ON job_descriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
