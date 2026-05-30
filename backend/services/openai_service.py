import json
import os
import re
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

from config import load_local_env
from models import Question, ResumeUploadResponse


COMMON_ROLE_SKILLS = [
    "Python",
    "SQL",
    "Java",
    "JavaScript",
    "HTML",
    "CSS",
    "React",
    "Node.js",
    "MongoDB",
    "Tableau",
    "Power BI",
    "Pandas",
    "Data Cleaning",
    "Data Manipulation",
    "Hypothesis Testing",
    "Matplotlib",
    "Seaborn",
]


class OpenAIService:
    def __init__(self) -> None:
        self.api_key = ""
        self.model = "gpt-4o-mini"
        self.endpoint = "https://api.openai.com/v1/chat/completions"
        self.last_error = ""
        self.provider = "openai"
        self.ollama_model = "llama3:latest"
        self.ollama_base_url = "http://localhost:11434"
        self._refresh_config()

    def is_configured(self) -> bool:
        self._refresh_config()
        if self.provider == "ollama":
            return True
        return bool(self.api_key)

    def get_last_error(self) -> str:
        return self.last_error

    def _refresh_config(self) -> None:
        load_local_env()
        self.provider = os.getenv("AI_PROVIDER", "openai").strip().lower() or "openai"
        self.api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"
        self.ollama_model = os.getenv("OLLAMA_MODEL", "llama3:latest").strip() or "llama3:latest"
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").strip().rstrip("/")

    def analyze_resume(self, resume: ResumeUploadResponse, jd_text: Optional[str] = "") -> Dict[str, Any]:
        fallback = self._fallback_resume_analysis(resume, jd_text)
        if not self.is_configured():
            return fallback

        prompt = {
            "resume": {
                "skills": resume.skills,
                "techStack": resume.techStack,
                "projects": [project.model_dump() for project in resume.projects],
                "experience": [experience.model_dump() for experience in resume.experience],
                "education": [education.model_dump() for education in resume.education],
                "certifications": resume.certifications,
            },
            "job_description": jd_text or "",
        }

        instructions = (
            "You are an expert technical recruiter and resume reviewer. "
            "Analyze the structured resume against the job description when provided. "
            "Return only valid JSON with keys: match_score as an integer 0-100, "
            "missing_skills as an array of concise skill names, and suggestions as an array "
            "of 3-5 specific resume improvement suggestions. Do not invent experience."
        )

        data = self._request_json(instructions, prompt)
        if not data:
            return fallback

        return {
            "match_score": self._clamp_score(data.get("match_score"), fallback["match_score"]),
            "missing_skills": self._clean_list(data.get("missing_skills"), fallback["missing_skills"])[:8],
            "suggestions": self._clean_list(data.get("suggestions"), fallback["suggestions"])[:5],
            "ai_provider": self.provider,
        }

    def evaluate_answer(self, question: Question, answer: str) -> Optional[Dict[str, Any]]:
        if os.getenv("AI_SCORE_ANSWERS", "false").strip().lower() != "true":
            return None

        if not self.is_configured() or not answer.strip():
            return None

        instructions = (
            "You are an AI mock interview evaluator. Score the candidate answer fairly. "
            "Return only valid JSON with keys: score as an integer 0-100, "
            "is_correct as a boolean, and feedback as one concise coaching sentence."
        )
        prompt = {
            "question": question.question,
            "category": question.category,
            "difficulty": question.difficulty,
            "candidate_answer": answer,
        }
        data = self._request_json(instructions, prompt)
        if not data:
            return None

        score = self._clamp_score(data.get("score"), 50)
        feedback = str(data.get("feedback") or "").strip()
        return {
            "score": score,
            "is_correct": bool(data.get("is_correct", score >= 60)),
            "feedback": feedback or "Good attempt. Add more concrete examples and tradeoffs to strengthen the answer.",
        }

    def generate_interview_question(
        self,
        interview_id: str,
        interview_type: str,
        skills: List[str],
        projects: List[Any],
        jd_text: Optional[str],
        question_number: int,
        previous_questions: List[str],
        previous_score: Optional[int] = None,
    ) -> Optional[Question]:
        if not self.is_configured():
            self.last_error = "OPENAI_API_KEY is missing. Add it to .env and restart the backend."
            return None

        project_payload = [
            project.model_dump() if hasattr(project, "model_dump") else project
            for project in projects[:3]
        ]
        instructions = (
            "Generate one concise mock interview question. Personalize it to the candidate context. "
            "Avoid repeats. Return only JSON: question, difficulty, category."
        )
        prompt = {
            "interview_type": interview_type,
            "skills": skills[:8],
            "projects": project_payload[:1],
            "job_description": (jd_text or "")[:700],
            "question_number": question_number,
            "previous_questions": previous_questions[-4:],
            "previous_score": previous_score,
            "difficulty_guidance": self._difficulty_guidance(question_number, previous_score),
        }

        data = self._request_json(instructions, prompt)
        if not data:
            return None

        question_text = str(data.get("question") or "").strip()
        if len(question_text) < 20:
            return None

        category = str(data.get("category") or interview_type or "technical").strip().lower().replace(" ", "_")
        difficulty = str(data.get("difficulty") or "medium").strip().lower()
        if difficulty not in {"easy", "medium", "hard"}:
            difficulty = "medium"

        safe_category = re.sub(r"[^a-z0-9_]+", "_", category).strip("_") or "technical"
        return Question(
            id=f"{self.provider}_{interview_id}_{question_number}",
            question=question_text,
            difficulty=difficulty,
            category=safe_category,
            source=self.provider,
        )

    def _request_json(self, instructions: str, prompt: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if self.provider == "ollama":
            return self._request_ollama_json(instructions, prompt)

        body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": instructions},
                {"role": "user", "content": json.dumps(prompt, ensure_ascii=True)},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7,
            "max_tokens": 280,
        }
        request = urllib.request.Request(
            self.endpoint,
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=8) as response:
                payload = json.loads(response.read().decode("utf-8"))
            self.last_error = ""
        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="ignore")
            self.last_error = self._format_openai_error(exc.code, error_body)
            print(f"OpenAI request failed ({exc.code}): {error_body[:500]}")
            return None
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError) as exc:
            self.last_error = f"OpenAI request failed: {exc}"
            print(self.last_error)
            return None

        text = self._extract_output_text(payload)
        if not text:
            return None

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if not match:
                return None
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return None

    def _extract_output_text(self, payload: Dict[str, Any]) -> str:
        choices = payload.get("choices") or []
        if choices:
            message = choices[0].get("message", {})
            if message.get("content"):
                return str(message["content"]).strip()

        if payload.get("output_text"):
            return str(payload["output_text"]).strip()

        parts: List[str] = []
        for item in payload.get("output", []):
            for content in item.get("content", []):
                if "text" in content:
                    parts.append(str(content["text"]))
        return "\n".join(parts).strip()

    def _fallback_resume_analysis(self, resume: ResumeUploadResponse, jd_text: Optional[str]) -> Dict[str, Any]:
        skills = self._normalized_skill_set(resume)
        if not skills:
            return {
                "match_score": 0,
                "missing_skills": [],
                "suggestions": ["Upload a readable resume with a skills section to generate stronger AI suggestions."],
                "ai_provider": "fallback",
            }

        jd = self._normalize(jd_text or "")
        if len(jd) > 20:
            matched = [
                skill
                for skill in skills
                if skill in jd or any(len(part) > 3 and part in jd for part in skill.split())
            ]
            match_score = min(98, max(35, round((len(matched) / len(skills)) * 100)))
            missing = [
                skill
                for skill in COMMON_ROLE_SKILLS
                if self._normalize(skill) in jd and self._normalize(skill) not in skills
            ][:8]
        else:
            common = [self._normalize(skill) for skill in COMMON_ROLE_SKILLS]
            known_matches = [skill for skill in skills if any(target in skill or skill in target for target in common)]
            breadth_score = min(45, len(skills) * 4)
            relevance_score = min(45, len(known_matches) * 7)
            profile_score = min(10, len(resume.projects) * 3 + len(resume.experience) * 4)
            match_score = min(95, max(45, breadth_score + relevance_score + profile_score))
            missing = [
                skill
                for skill in COMMON_ROLE_SKILLS
                if not any(self._normalize(skill) in detected or detected in self._normalize(skill) for detected in skills)
            ][:5]

        suggestions = self._fallback_suggestions(resume, missing, match_score, len(jd) > 20)
        return {
            "match_score": match_score,
            "missing_skills": missing,
            "suggestions": suggestions,
            "ai_provider": "fallback",
        }

    def _fallback_suggestions(
        self,
        resume: ResumeUploadResponse,
        missing_skills: List[str],
        match_score: int,
        has_jd_text: bool,
    ) -> List[str]:
        suggestions = []
        if not has_jd_text:
            suggestions.append("Paste the job description to calculate a more accurate resume-to-role match.")
        if missing_skills:
            suggestions.append(f"Add relevant proof for {', '.join(missing_skills[:3])} if you genuinely have that experience.")
        if not resume.projects:
            suggestions.append("Add 2-3 project bullets with your role, tech stack, and measurable outcomes.")
        if not resume.experience:
            suggestions.append("Include work experience or internships with action verbs and impact metrics.")
        if len(resume.skills) > 12:
            suggestions.append("Group skills into Languages, Frameworks, Databases, and Tools for faster recruiter scanning.")
        if match_score < 60:
            suggestions.append("Tailor resume keywords to the target role before applying.")
        return suggestions or ["Your resume has a strong skills section. Add quantified impact to make it more recruiter-ready."]

    def _normalized_skill_set(self, resume: ResumeUploadResponse) -> List[str]:
        values = []
        seen = set()
        for skill in [*resume.skills, *resume.techStack]:
            normalized = self._normalize(skill)
            if normalized and normalized not in seen:
                seen.add(normalized)
                values.append(normalized)
        return values

    def _normalize(self, value: str) -> str:
        return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9+#. ]", " ", value.lower())).strip()

    def _clean_list(self, value: Any, fallback: List[str]) -> List[str]:
        if not isinstance(value, list):
            return fallback
        cleaned = [str(item).strip() for item in value if str(item).strip()]
        return cleaned or fallback

    def _clamp_score(self, value: Any, fallback: int) -> int:
        try:
            score = int(round(float(value)))
        except (TypeError, ValueError):
            return fallback
        return max(0, min(100, score))

    def _request_ollama_json(self, instructions: str, prompt: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        body = {
            "model": self.ollama_model,
            "stream": False,
            "messages": [
                {"role": "system", "content": instructions},
                {"role": "user", "content": json.dumps(prompt, ensure_ascii=True)},
            ],
            "format": "json",
            "options": {
                "temperature": 0.45,
                "num_ctx": 2048,
                "num_predict": 90,
            },
        }
        request = urllib.request.Request(
            f"{self.ollama_base_url}/api/chat",
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                payload = json.loads(response.read().decode("utf-8"))
            self.last_error = ""
        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="ignore")
            self.last_error = f"Ollama request failed ({exc.code}): {error_body[:300]}"
            print(self.last_error)
            return None
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError) as exc:
            self.last_error = (
                f"Ollama is not reachable at {self.ollama_base_url}. "
                f"Make sure Ollama is running and {self.ollama_model} is installed. Details: {exc}"
            )
            print(self.last_error)
            return None

        text = str(payload.get("message", {}).get("content") or "").strip()
        if not text:
            self.last_error = "Ollama returned an empty response."
            return None

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if not match:
                self.last_error = f"Ollama returned non-JSON text: {text[:200]}"
                return None
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                self.last_error = f"Ollama returned invalid JSON: {text[:200]}"
                return None

    def _format_openai_error(self, status_code: int, error_body: str) -> str:
        try:
            payload = json.loads(error_body)
            message = payload.get("error", {}).get("message")
            code = payload.get("error", {}).get("code")
        except json.JSONDecodeError:
            message = error_body.strip()
            code = None

        if code == "insufficient_quota":
            return "OpenAI quota is exhausted. Add billing/API credits in the OpenAI dashboard, then restart the backend."

        if status_code == 401:
            return "OpenAI API key is invalid. Check OPENAI_API_KEY in .env, then restart the backend."

        if status_code == 429:
            return message or "OpenAI rate limit reached. Wait a moment or check your OpenAI billing limits."

        return message or f"OpenAI request failed with status {status_code}."

    def _difficulty_guidance(self, question_number: int, previous_score: Optional[int]) -> str:
        if question_number <= 1:
            return "Start with a focused but approachable question."
        if previous_score is None:
            return "Ask a medium-depth follow-up question."
        if previous_score >= 80:
            return "Increase depth with architecture, tradeoffs, edge cases, or scale."
        if previous_score >= 60:
            return "Ask a medium follow-up that tests practical understanding."
        return "Ask a simpler clarifying question that lets the candidate recover."


openai_service = OpenAIService()
