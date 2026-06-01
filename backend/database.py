import os
import httpx

# Monkeypatch httpx to support the 'proxy' parameter in older versions (like 0.25.x)
# which was renamed/changed from 'proxies' in 0.26.0. This prevents a TypeError in gotrue.
original_client_init = httpx.Client.__init__
def custom_client_init(self, *args, **kwargs):
    if 'proxy' in kwargs:
        kwargs['proxies'] = kwargs.pop('proxy')
    original_client_init(self, *args, **kwargs)
httpx.Client.__init__ = custom_client_init

original_async_client_init = httpx.AsyncClient.__init__
def custom_async_client_init(self, *args, **kwargs):
    if 'proxy' in kwargs:
        kwargs['proxies'] = kwargs.pop('proxy')
    original_async_client_init(self, *args, **kwargs)
httpx.AsyncClient.__init__ = custom_async_client_init

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
    import re
    # Temporary monkeypatch to support new Supabase key formats (sb_secret_..., sb_publishable_...)
    # in older versions of supabase-py that strictly validate JWT keys using regex.
    original_re_match = re.match
    def custom_re_match(pattern, string, flags=0):
        if pattern == r"^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$":
            if string and (string.startswith("sb_secret_") or string.startswith("sb_publishable_")):
                class DummyMatch:
                    pass
                return DummyMatch()
        return original_re_match(pattern, string, flags)
    re.match = custom_re_match
    try:
        supabase = create_client(supabase_url, supabase_key)
    finally:
        re.match = original_re_match


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

    def create_job_application(self, application_data: dict):
        response = self._table("job_applications").insert(application_data).execute()
        return response.data[0] if response.data else None

    def get_candidate_applications(self, candidate_id: str):
        response = self._table("job_applications").select("*, job_descriptions(*)").eq("candidate_id", candidate_id).order("applied_at", desc=True).execute()
        return response.data

    def get_job_applications(self, job_id: str):
        response = self._table("job_applications").select("*, users!candidate_id(full_name, email)").eq("job_id", job_id).order("applied_at", desc=True).execute()
        return response.data

    def update_job_application(self, application_id: str, application_data: dict):
        response = self._table("job_applications").update(application_data).eq("id", application_id).execute()
        return response.data[0] if response.data else None

    def get_all_job_applications(self):
        response = self._table("job_applications").select("*, job_descriptions(*), users!candidate_id(full_name, email)").order("applied_at", desc=True).execute()
        return response.data


db = Database(supabase)
