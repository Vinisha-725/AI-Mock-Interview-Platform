import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

supabase: Client = create_client(supabase_url, supabase_key)


# Database helper functions
class Database:
    def __init__(self, client: Client):
        self.client = client

    # User operations
    def get_user_by_email(self, email: str):
        response = self.client.table('users').select('*').eq('email', email).execute()
        return response.data[0] if response.data else None

    def create_user(self, user_data: dict):
        response = self.client.table('users').insert(user_data).execute()
        return response.data[0] if response.data else None

    def update_user(self, user_id: str, user_data: dict):
        response = self.client.table('users').update(user_data).eq('id', user_id).execute()
        return response.data[0] if response.data else None

    # Candidate profile operations
    def get_candidate_profile(self, user_id: str):
        response = self.client.table('candidate_profiles').select('*').eq('user_id', user_id).execute()
        return response.data[0] if response.data else None

    def create_candidate_profile(self, profile_data: dict):
        response = self.client.table('candidate_profiles').insert(profile_data).execute()
        return response.data[0] if response.data else None

    def update_candidate_profile(self, user_id: str, profile_data: dict):
        response = self.client.table('candidate_profiles').update(profile_data).eq('user_id', user_id).execute()
        return response.data[0] if response.data else None

    # Recruiter profile operations
    def get_recruiter_profile(self, user_id: str):
        response = self.client.table('recruiter_profiles').select('*').eq('user_id', user_id).execute()
        return response.data[0] if response.data else None

    def create_recruiter_profile(self, profile_data: dict):
        response = self.client.table('recruiter_profiles').insert(profile_data).execute()
        return response.data[0] if response.data else None

    def update_recruiter_profile(self, user_id: str, profile_data: dict):
        response = self.client.table('recruiter_profiles').update(profile_data).eq('user_id', user_id).execute()
        return response.data[0] if response.data else None

    # Interview session operations
    def get_interview_session(self, interview_id: str):
        response = self.client.table('interview_sessions').select('*').eq('interview_id', interview_id).execute()
        return response.data[0] if response.data else None

    def create_interview_session(self, session_data: dict):
        response = self.client.table('interview_sessions').insert(session_data).execute()
        return response.data[0] if response.data else None

    def update_interview_session(self, interview_id: str, session_data: dict):
        response = self.client.table('interview_sessions').update(session_data).eq('interview_id', interview_id).execute()
        return response.data[0] if response.data else None

    def get_user_sessions(self, user_id: str):
        response = self.client.table('interview_sessions').select('*').eq('user_id', user_id).order('start_time', desc=True).execute()
        return response.data

    # Session history operations
    def create_session_history(self, history_data: dict):
        response = self.client.table('session_history').insert(history_data).execute()
        return response.data[0] if response.data else None

    def get_user_history(self, user_id: str):
        response = self.client.table('session_history').select('*').eq('user_id', user_id).order('date', desc=True).execute()
        return response.data

    def get_all_history(self):
        response = self.client.table('session_history').select('*').order('date', desc=True).execute()
        return response.data

    # Interview questions operations
    def create_interview_question(self, question_data: dict):
        response = self.client.table('interview_questions').insert(question_data).execute()
        return response.data[0] if response.data else None

    def get_session_questions(self, session_id: str):
        response = self.client.table('interview_questions').select('*').eq('session_id', session_id).execute()
        return response.data

    # Interview answers operations
    def create_interview_answer(self, answer_data: dict):
        response = self.client.table('interview_answers').insert(answer_data).execute()
        return response.data[0] if response.data else None

    def get_session_answers(self, session_id: str):
        response = self.client.table('interview_answers').select('*').eq('session_id', session_id).execute()
        return response.data

    # Job description operations
    def create_job_description(self, jd_data: dict):
        response = self.client.table('job_descriptions').insert(jd_data).execute()
        return response.data[0] if response.data else None

    def get_recruiter_job_descriptions(self, recruiter_id: str):
        response = self.client.table('job_descriptions').select('*').eq('recruiter_id', recruiter_id).order('created_at', desc=True).execute()
        return response.data


# Initialize database instance
db = Database(supabase)
