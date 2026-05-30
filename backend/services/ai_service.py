from typing import List
from models import Question

class AIService:
    def __init__(self):
        self.questions = {
            "easy": [
                Question(id=1, question="Tell me about yourself and your experience.", difficulty="easy"),
                Question(id=2, question="What are your strengths and weaknesses?", difficulty="easy"),
                Question(id=3, question="Why do you want to work in this field?", difficulty="easy"),
            ],
            "medium": [
                Question(id=4, question="Describe a challenging project you worked on and how you overcame obstacles.", difficulty="medium"),
                Question(id=5, question="How do you handle tight deadlines and pressure?", difficulty="medium"),
                Question(id=6, question="Explain a technical concept to someone non-technical.", difficulty="medium"),
            ],
            "hard": [
                Question(id=7, question="Design a scalable system for a real-time chat application.", difficulty="hard"),
                Question(id=8, question="How would you optimize a slow database query?", difficulty="hard"),
                Question(id=9, question="Discuss the trade-offs between different architectural patterns.", difficulty="hard"),
            ]
        }
        self.question_index = 0

    def get_first_question(self, skills: List[str]) -> Question:
        self.question_index = 0
        return self.questions["easy"][0]

    def get_next_question(self, previous_score: int) -> Question:
        self.question_index += 1
        
        if previous_score > 70:
            difficulty = "hard"
        elif previous_score > 50:
            difficulty = "medium"
        else:
            difficulty = "easy"
        
        questions = self.questions[difficulty]
        index = self.question_index % len(questions)
        return questions[index]

    def should_continue(self, question_count: int) -> bool:
        return question_count < 5

ai_service = AIService()
