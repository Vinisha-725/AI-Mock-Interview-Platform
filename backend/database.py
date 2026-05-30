import os

try:
    from dotenv import load_dotenv
    from supabase import Client, create_client
except ImportError:
    load_dotenv = None
    Client = None
    create_client = None

if load_dotenv:
    load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

supabase = None
if supabase_url and supabase_key and create_client:
    supabase = create_client(supabase_url, supabase_key)


class Database:
    def __init__(self, client):
        self.client = client

    def _table(self, name: str):
        if not self.client:
            raise RuntimeError("Supabase is not configured")
        return self.client.table(name)

    def get_user_by_email(self, email: str):
        response = self._table("users").select("*").eq("email", email).execute()
        return response.data[0] if response.data else None

    def create_user(self, user_data: dict):
        response = self._table("users").insert(user_data).execute()
        return response.data[0] if response.data else None

    def update_user(self, user_id: str, user_data: dict):
        response = self._table("users").update(user_data).eq("id", user_id).execute()
        return response.data[0] if response.data else None

    def get_candidate_profile(self, user_id: str):
        response = self._table("candidate_profiles").select("*").eq("user_id", user_id).execute()
        return response.data[0] if response.data else None

    def create_candidate_profile(self, profile_data: dict):
        response = self._table("candidate_profiles").insert(profile_data).execute()
        return response.data[0] if response.data else None

    def update_candidate_profile(self, user_id: str, profile_data: dict):
        response = self._table("candidate_profiles").update(profile_data).eq("user_id", user_id).execute()
        return response.data[0] if response.data else None

    def get_recruiter_profile(self, user_id: str):
        response = self._table("recruiter_profiles").select("*").eq("user_id", user_id).execute()
        return response.data[0] if response.data else None

    def create_recruiter_profile(self, profile_data: dict):
        response = self._table("recruiter_profiles").insert(profile_data).execute()
        return response.data[0] if response.data else None

    def update_recruiter_profile(self, user_id: str, profile_data: dict):
        response = self._table("recruiter_profiles").update(profile_data).eq("user_id", user_id).execute()
        return response.data[0] if response.data else None

    def get_interview_session(self, interview_id: str):
        response = self._table("interview_sessions").select("*").eq("interview_id", interview_id).execute()
        return response.data[0] if response.data else None

    def create_interview_session(self, session_data: dict):
        response = self._table("interview_sessions").insert(session_data).execute()
        return response.data[0] if response.data else None

    def update_interview_session(self, interview_id: str, session_data: dict):
        response = self._table("interview_sessions").update(session_data).eq("interview_id", interview_id).execute()
        return response.data[0] if response.data else None

    def get_user_sessions(self, user_id: str):
        response = self._table("interview_sessions").select("*").eq("user_id", user_id).order("start_time", desc=True).execute()
        return response.data

    def create_session_history(self, history_data: dict):
        response = self._table("session_history").insert(history_data).execute()
        return response.data[0] if response.data else None

    def get_user_history(self, user_id: str):
        response = self._table("session_history").select("*").eq("user_id", user_id).order("date", desc=True).execute()
        return response.data

    def get_all_history(self):
        response = self._table("session_history").select("*").order("date", desc=True).execute()
        return response.data

    def create_interview_question(self, question_data: dict):
        response = self._table("interview_questions").insert(question_data).execute()
        return response.data[0] if response.data else None

    def get_session_questions(self, session_id: str):
        response = self._table("interview_questions").select("*").eq("session_id", session_id).execute()
        return response.data

    def create_interview_answer(self, answer_data: dict):
        response = self._table("interview_answers").insert(answer_data).execute()
        return response.data[0] if response.data else None

    def get_session_answers(self, session_id: str):
        response = self._table("interview_answers").select("*").eq("session_id", session_id).execute()
        return response.data

    def create_job_description(self, jd_data: dict):
        response = self._table("job_descriptions").insert(jd_data).execute()
        return response.data[0] if response.data else None

    def get_recruiter_job_descriptions(self, recruiter_id: str):
        response = self._table("job_descriptions").select("*").eq("recruiter_id", recruiter_id).order("created_at", desc=True).execute()
        return response.data


db = Database(supabase)
