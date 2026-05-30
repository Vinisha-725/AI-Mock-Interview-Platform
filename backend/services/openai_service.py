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

TECHNICAL_KEYWORDS = [
    # Programming Languages
    "JavaScript", "Python", "Java", "C++", "C#", "C", "Go", "Rust", "Swift", "Kotlin", "PHP", "Ruby", "Scala", "TypeScript", "R", "MATLAB", "Perl", "Lua", "Haskell", "Shell", "Bash", "PowerShell",
    # Frontend
    "React", "React.js", "Angular", "Vue", "Vue.js", "Next.js", "Nuxt.js", "Svelte", "Ember", "Backbone", "jQuery", "HTML", "HTML5", "CSS", "CSS3", "SASS", "SCSS", "LESS", "Tailwind", "Tailwind CSS", "Bootstrap", "Vite", "Redux", "Webpack",
    # Backend
    "Node.js", "Node", "Express", "Express.js", "Django", "Flask", "FastAPI", "Spring", "Spring Boot", "Ruby on Rails", "Laravel", "ASP.NET", "NestJS", "Hapi", "Koa",
    # Databases
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Mongoose", "Redis", "Elasticsearch", "Cassandra", "DynamoDB", "Firebase", "SQLite", "Oracle", "MariaDB", "Supabase", "Prisma",
    # Cloud & DevOps
    "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", "GitLab CI", "CircleCI", "Travis CI", "Vercel", "Netlify", "Heroku", "Cloudflare",
    # Tools & Version Control
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Slack", "VS Code", "IntelliJ", "Eclipse", "Visual Studio", "Postman", "Figma", "Docker Compose",
    # APIs & Architecture
    "REST", "RESTful", "GraphQL", "SOAP", "API", "Microservices", "Monolith", "Serverless", "gRPC", "WebSockets",
    # Data Science & ML & AI
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Jupyter", "Spark", "Hadoop", "OpenAI", "LLM", "LangChain", "Machine Learning", "Deep Learning", "AI", "Artificial Intelligence", "Data Science", "Big Data", "NLP", "Computer Vision",
    # Mobile
    "React Native", "Flutter", "Ionic", "Xamarin", "Android", "iOS", "SwiftUI", "Jetpack Compose",
    # Methodologies & Other
    "Linux", "Unix", "CI/CD", "Agile", "Scrum", "Kanban", "DevOps", "TDD", "BDD", "Unit Testing", "System Design", "OOP", "Data Structures", "Algorithms", "SaaS", "PaaS", "IaaS"
]



class OpenAIService:
    def __init__(self) -> None:
        self.api_key = ""
        self.model = "gpt-4o-mini"
        self.endpoint = "https://api.openai.com/v1/chat/completions"
        self.last_error = ""
        self.provider = "openai"
        self.ollama_model = "llama3.2:3b"
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
        if os.getenv("AI_ANALYZE_RESUME", "true").strip().lower() != "true":
            return fallback

        if not self.is_configured():
            return fallback

        prompt = {
            "resume": {
                "skills": resume.skills[:20],
                "techStack": resume.techStack[:20],
                "projects": [project.model_dump() for project in resume.projects[:2]],
                "experience": [experience.model_dump() for experience in resume.experience[:2]],
                "education": [education.model_dump() for education in resume.education[:1]],
                "certifications": resume.certifications,
            },
            "job_description": (jd_text or "")[:700],
        }
        instructions = (
            "Analyze resume fit quickly. Return only compact JSON with match_score 0-100, "
            "missing_skills array max 6, suggestions array max 4. Do not invent experience."
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
            "You are an AI mock interview evaluator. Return only JSON with score 0-100, "
            "is_correct boolean, and one concise feedback sentence."
        )
        prompt = {
            "question": question.question,
            "category": question.category,
            "difficulty": question.difficulty,
            "candidate_answer": answer[:1600],
        }
        data = self._request_json(instructions, prompt)
        if not data:
            return None

        score = self._clamp_score(data.get("score"), 50)
        feedback = str(data.get("feedback") or "").strip()
        return {
            "score": score,
            "is_correct": bool(data.get("is_correct", score >= 60)),
            "feedback": feedback or "Good attempt. Add more concrete examples to strengthen the answer.",
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
            for project in projects[:1]
        ]
        instructions = (
            "Generate one concise mock interview question. Personalize it to the candidate context. "
            "Avoid repeats. Return only JSON: question, difficulty, category."
        )
        prompt = {
            "interview_type": interview_type,
            "skills": skills[:8],
            "projects": project_payload,
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
        return self._request_openai_json(instructions, prompt)

    def _request_openai_json(self, instructions: str, prompt: Dict[str, Any]) -> Optional[Dict[str, Any]]:
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
        return self._parse_json_text(text)

    def _request_ollama_json(self, instructions: str, prompt: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        is_resume_analysis = "match_score" in instructions
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
                "num_ctx": 1536 if is_resume_analysis else 2048,
                "num_predict": 130 if is_resume_analysis else 90,
            },
        }
        request = urllib.request.Request(
            f"{self.ollama_base_url}/api/chat",
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        # Snappy 1.5-second timeout for resume analysis to fallback instantly to accurate local detection
        timeout = 1.5 if is_resume_analysis else 45.0

        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
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
        return self._parse_json_text(text)

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

    def _parse_json_text(self, text: str) -> Optional[Dict[str, Any]]:
        if not text:
            self.last_error = f"{self.provider.title()} returned an empty response."
            return None
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if not match:
                self.last_error = f"{self.provider.title()} returned non-JSON text: {text[:200]}"
                return None
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                self.last_error = f"{self.provider.title()} returned invalid JSON: {text[:200]}"
                return None

    def _fallback_resume_analysis(self, resume: ResumeUploadResponse, jd_text: Optional[str]) -> Dict[str, Any]:
        # Get resume skills
        resume_skills = self._normalized_skill_set(resume)
        
        # If no skills detected on the resume, return fallback response
        if not resume_skills:
            return {
                "match_score": 0,
                "missing_skills": [],
                "suggestions": ["Upload a readable resume with a skills section to generate stronger AI suggestions."],
                "ai_provider": "local",
            }

        jd = (jd_text or "").strip()
        
        # If we have a meaningful job description
        if len(jd) > 20:
            # 1. Extract skills from the JD using case-insensitive exact keyword boundaries
            jd_skills_found = []
            for keyword in TECHNICAL_KEYWORDS:
                start_boundary = r'(?<![A-Za-z0-9+#]|(?<=[A-Za-z0-9])\.)'
                end_boundary = r'(?![A-Za-z0-9+#]|\.(?=[A-Za-z0-9]))'
                pattern = start_boundary + re.escape(keyword) + end_boundary
                if re.search(pattern, jd, re.IGNORECASE):
                    jd_skills_found.append(keyword)
            
            # If we found skills in the JD
            if jd_skills_found:
                # 2. Find which JD skills are in the resume
                matched_skills = []
                missing_skills = []
                
                # Normalize resume skills for matching
                norm_resume_skills = [self._normalize(s) for s in resume_skills]
                
                for skill in jd_skills_found:
                    norm_skill = self._normalize(skill)
                    # Check if any resume skill matches or contains this JD skill
                    if any(norm_skill in r_skill or r_skill in norm_skill for r_skill in norm_resume_skills):
                        matched_skills.append(skill)
                    else:
                        missing_skills.append(skill)
                
                # Industry standard ATS matching: percentage of JD skills matched
                match_score = round((len(matched_skills) / len(jd_skills_found)) * 100)
                match_score = min(98, max(25, match_score))
                missing_skills_display = missing_skills[:8]
            else:
                # No specific technical skills found in JD, fall back to general text matching
                norm_resume_skills = [self._normalize(s) for s in resume_skills]
                norm_jd = self._normalize(jd)
                matched_skills = [
                    s for s in resume_skills
                    if self._normalize(s) in norm_jd or any(len(part) > 3 and part in norm_jd for part in self._normalize(s).split())
                ]
                match_score = min(95, max(35, round((len(matched_skills) / len(resume_skills)) * 100)))
                
                # Find some common role skills in JD missing from resume
                missing_skills_display = [
                    s for s in COMMON_ROLE_SKILLS
                    if self._normalize(s) in norm_jd and not any(self._normalize(s) in r_skill or r_skill in self._normalize(s) for r_skill in norm_resume_skills)
                ][:6]
        else:
            # No JD provided, calculate score based on resume breadth and depth
            common = [self._normalize(skill) for skill in COMMON_ROLE_SKILLS]
            known_matches = [skill for skill in resume_skills if any(target in skill or skill in target for target in common)]
            breadth_score = min(45, len(resume_skills) * 4)
            relevance_score = min(45, len(known_matches) * 7)
            profile_score = min(10, len(resume.projects) * 3 + len(resume.experience) * 4)
            match_score = min(95, max(45, breadth_score + relevance_score + profile_score))
            
            norm_resume_skills = [self._normalize(s) for s in resume_skills]
            missing_skills_display = [
                skill
                for skill in COMMON_ROLE_SKILLS
                if not any(self._normalize(skill) in detected or detected in self._normalize(skill) for detected in norm_resume_skills)
            ][:5]

        # Generate highly accurate and contextual suggestions
        suggestions = []
        if len(jd) <= 20:
            suggestions.append("Paste the job description to calculate a more accurate resume-to-role match.")
        
        if len(jd) > 20 and missing_skills_display:
            suggestions.append(f"Add relevant proof or projects for {', '.join(missing_skills_display[:3])} if you have that experience.")
            
        if not resume.projects:
            suggestions.append("Add 2-3 project bullets with your role, tech stack, and measurable outcomes.")
        elif len(resume.projects) < 2:
            suggestions.append("Consider adding another technical project to showcase a broader range of skills.")
            
        if not resume.experience:
            suggestions.append("Include work experience or internships with action verbs and impact metrics.")
            
        if len(resume_skills) > 15:
            suggestions.append("Group skills into Languages, Frameworks, Databases, and Tools for faster recruiter scanning.")
            
        if match_score < 65:
            suggestions.append("Tailor your resume terminology to align more closely with the keywords in the job description.")
        elif match_score >= 85:
            suggestions.append("Your resume has an exceptional match score! Make sure your achievements are quantified to stand out.")
            
        if not suggestions:
            suggestions.append("Your resume matches this role well. Ensure all experience bullet points use action-oriented verbs.")
            
        return {
            "match_score": match_score,
            "missing_skills": missing_skills_display,
            "suggestions": suggestions[:4],
            "ai_provider": "local",
        }

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
