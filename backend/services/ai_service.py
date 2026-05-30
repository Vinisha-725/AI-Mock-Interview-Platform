from typing import List, Optional
from models import Question, Project
import uuid
from datetime import datetime

class AIService:
    def __init__(self):
        # Question bank with categories and follow-up support
        self.question_bank = {
            "technical": [
                Question(id="tech_1", question="Tell me about your experience with {skill}.", difficulty="easy", category="technical"),
                Question(id="tech_2", question="How would you troubleshoot a performance issue in a {skill} application?", difficulty="medium", category="technical"),
                Question(id="tech_3", question="Explain the architecture of a system you built using {skill}.", difficulty="hard", category="technical"),
                Question(id="tech_4", question="What are the best practices for writing clean {skill} code?", difficulty="medium", category="technical"),
                Question(id="tech_5", question="How do you handle error handling in {skill}?", difficulty="easy", category="technical"),
            ],
            "project": [
                Question(id="proj_1", question="Walk me through your {project_name} project.", difficulty="easy", category="project"),
                Question(id="proj_2", question="What was the biggest technical challenge in {project_name} and how did you solve it?", difficulty="medium", category="project"),
                Question(id="proj_3", question="How would you scale {project_name} to handle 10x more users?", difficulty="hard", category="project"),
                Question(id="proj_4", question="What trade-offs did you make in {project_name}?", difficulty="medium", category="project"),
                Question(id="proj_5", question="If you could rebuild {project_name}, what would you do differently?", difficulty="hard", category="project"),
            ],
            "behavioral": [
                Question(id="behav_1", question="Tell me about a time you had to work with a difficult team member.", difficulty="easy", category="behavioral"),
                Question(id="behav_2", question="Describe a situation where you had to learn a new technology quickly.", difficulty="medium", category="behavioral"),
                Question(id="behav_3", question="How do you prioritize tasks when everything seems urgent?", difficulty="medium", category="behavioral"),
                Question(id="behav_4", question="Tell me about a project that failed and what you learned from it.", difficulty="hard", category="behavioral"),
            ],
            "system_design": [
                Question(id="sd_1", question="Design a URL shortening service like bit.ly.", difficulty="medium", category="system_design"),
                Question(id="sd_2", question="Design a real-time chat application.", difficulty="hard", category="system_design"),
                Question(id="sd_3", question="Design a file storage system like Google Drive.", difficulty="hard", category="system_design"),
                Question(id="sd_4", question="How would you design a rate limiter?", difficulty="medium", category="system_design"),
            ]
        }
        
        # Track used questions per session to avoid repetition
        self.used_questions = {}  # session_id -> set of question_ids
        
        # DSA questions
        self.dsa_questions = [
            Question(id="dsa_1", question="Explain the time and space complexity of binary search.", difficulty="easy", category="dsa"),
            Question(id="dsa_2", question="Implement a function to reverse a linked list.", difficulty="easy", category="dsa"),
            Question(id="dsa_3", question="Explain the difference between BFS and DFS.", difficulty="medium", category="dsa"),
            Question(id="dsa_4", question="How would you detect a cycle in a linked list?", difficulty="medium", category="dsa"),
            Question(id="dsa_5", question="Explain dynamic programming with an example.", difficulty="hard", category="dsa"),
            Question(id="dsa_6", question="Implement a function to find the longest palindromic substring.", difficulty="hard", category="dsa"),
        ]
        
        # Aptitude questions
        self.aptitude_questions = [
            Question(id="apt_1", question="If a train travels at 60 km/h for 2 hours, how far does it travel?", difficulty="easy", category="aptitude"),
            Question(id="apt_2", question="What is 15% of 200?", difficulty="easy", category="aptitude"),
            Question(id="apt_3", question="If 3 workers can complete a task in 8 days, how many days will 6 workers take?", difficulty="medium", category="aptitude"),
            Question(id="apt_4", question="A shopkeeper sells an item at 20% profit. If the cost price is $500, what is the selling price?", difficulty="medium", category="aptitude"),
            Question(id="apt_5", question="Solve: 2x + 5 = 15", difficulty="easy", category="aptitude"),
        ]

    def generate_interview_id(self) -> str:
        return f"interview_{uuid.uuid4().hex[:8]}"

    def _format_question(self, question: Question, skill: Optional[str] = None, project_name: Optional[str] = None) -> Question:
        formatted = question.model_copy()
        if skill:
            formatted.question = formatted.question.replace("{skill}", skill)
        if project_name:
            formatted.question = formatted.question.replace("{project_name}", project_name)
        return formatted

    def get_first_question(self, skills: List[str], projects: List[Project], jd_text: Optional[str] = None, interview_type: str = "ai", session_id: str = None) -> Question:
        if session_id and session_id not in self.used_questions:
            self.used_questions[session_id] = set()
        
        if interview_type == "ai":
            # Generate question based on skills or projects
            if skills and len(skills) > 0:
                skill = skills[0]
                question = self._get_unused_question("technical", session_id)
                if question:
                    return self._format_question(question, skill=skill)
            
            if projects and len(projects) > 0:
                project = projects[0]
                question = self._get_unused_question("project", session_id)
                if question:
                    return self._format_question(question, project_name=project.name)
            
            # Fallback to behavioral question
            return self._get_unused_question("behavioral", session_id)
        
        elif interview_type == "dsa":
            return self._get_unused_question_from_list(self.dsa_questions, session_id)
        
        elif interview_type == "aptitude":
            return self._get_unused_question_from_list(self.aptitude_questions, session_id)
        
        return self.question_bank["technical"][0]

    def get_next_question(self, session_id: str, previous_score: int, skills: List[str], projects: List[Project], interview_type: str = "ai") -> Optional[Question]:
        if interview_type == "ai":
            # Determine difficulty based on previous score
            if previous_score > 70:
                category = "system_design"
            elif previous_score > 50:
                category = "project"
            else:
                category = "technical"
            
            question = self._get_unused_question(category, session_id)
            if question:
                skill = skills[len(self.used_questions.get(session_id, set())) % len(skills)] if skills else None
                project_name = projects[0].name if projects else None
                return self._format_question(question, skill=skill, project_name=project_name)
            return None
        
        elif interview_type == "dsa":
            return self._get_unused_question_from_list(self.dsa_questions, session_id)
        
        elif interview_type == "aptitude":
            return self._get_unused_question_from_list(self.aptitude_questions, session_id)
        
        return None

    def _get_unused_question(self, category: str, session_id: str) -> Optional[Question]:
        if session_id not in self.used_questions:
            self.used_questions[session_id] = set()
        
        available_questions = [q for q in self.question_bank[category] if q.id not in self.used_questions[session_id]]
        
        if not available_questions:
            # Reset used questions for this category if all have been used
            self.used_questions[session_id] = {qid for qid in self.used_questions[session_id] if qid not in [q.id for q in self.question_bank[category]]}
            available_questions = self.question_bank[category]
        
        if available_questions:
            question = available_questions[0]
            self.used_questions[session_id].add(question.id)
            return question.model_copy()
        
        return None

    def _get_unused_question_from_list(self, question_list: List[Question], session_id: str) -> Optional[Question]:
        if session_id not in self.used_questions:
            self.used_questions[session_id] = set()
        
        available_questions = [q for q in question_list if q.id not in self.used_questions[session_id]]
        
        if not available_questions:
            # Reset used questions if all have been used
            self.used_questions[session_id] = {qid for qid in self.used_questions[session_id] if qid not in [q.id for q in question_list]}
            available_questions = question_list
        
        if available_questions:
            question = available_questions[0]
            self.used_questions[session_id].add(question.id)
            return question.model_copy()
        
        return None

    def should_continue(self, question_count: int, consecutive_wrong: int, duration_minutes: int, max_duration: int = 15) -> bool:
        # End if more than 3 consecutive wrong answers
        if consecutive_wrong >= 3:
            return False
        
        # End if duration exceeded
        if duration_minutes >= max_duration:
            return False
        
        # Continue if under question limit
        return question_count < 10

    def evaluate_answer(self, question: Question, answer: str) -> tuple[int, str, bool]:
        # Simple evaluation logic - in production, this would use an AI model
        answer_lower = answer.lower()
        question_lower = question.question.lower()
        
        # Basic keyword matching for demo
        score = 50  # Base score
        
        # Check for relevant keywords based on question category
        if question.category == "technical":
            tech_keywords = ["explain", "how", "what", "describe"]
            if any(keyword in answer_lower for keyword in tech_keywords):
                score += 20
            if len(answer) > 50:
                score += 15
            if len(answer) > 100:
                score += 15
        
        elif question.category == "project":
            if "project" in answer_lower or "built" in answer_lower or "developed" in answer_lower:
                score += 25
            if len(answer) > 60:
                score += 15
            if len(answer) > 120:
                score += 10
        
        elif question.category == "behavioral":
            if "i" in answer_lower and "team" in answer_lower:
                score += 20
            if len(answer) > 40:
                score += 15
            if len(answer) > 80:
                score += 15
        
        elif question.category == "dsa":
            if "algorithm" in answer_lower or "time" in answer_lower or "complexity" in answer_lower:
                score += 25
            if len(answer) > 30:
                score += 15
            if len(answer) > 70:
                score += 10
        
        elif question.category == "aptitude":
            # Check if answer contains numbers
            if any(char.isdigit() for char in answer):
                score += 30
            if len(answer) > 10:
                score += 10
        
        score = min(score, 100)
        is_correct = score >= 60
        
        feedback = self._generate_feedback(score, question.category)
        
        return score, feedback, is_correct

    def _generate_feedback(self, score: int, category: str) -> str:
        if score >= 80:
            return "Excellent answer! You demonstrated strong understanding."
        elif score >= 60:
            return "Good answer with some room for improvement."
        elif score >= 40:
            return "Your answer shows basic understanding but needs more detail."
        else:
            return "Please provide a more detailed and specific answer."

ai_service = AIService()
