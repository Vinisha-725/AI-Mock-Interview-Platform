from typing import List

class ScoringService:
    def __init__(self):
        self.keywords = {
            "technical": ["javascript", "python", "react", "api", "database", "code", "programming", "development"],
            "communication": ["team", "collaborate", "communicate", "explain", "discuss", "present"],
            "problem_solving": ["solve", "solution", "approach", "challenge", "problem", "analytical"],
            "leadership": ["lead", "manage", "guide", "mentor", "responsibility", "project"]
        }

    def score_answer(self, answer: str, question_id: int) -> int:
        # Mock scoring based on keyword matching
        answer_lower = answer.lower()
        
        # Count keyword matches
        keyword_count = 0
        for category, keywords in self.keywords.items():
            for keyword in keywords:
                if keyword in answer_lower:
                    keyword_count += 1
        
        # Base score calculation
        base_score = min(keyword_count * 10, 60)
        
        # Add points for answer length (encourages detailed answers)
        length_bonus = min(len(answer.split()) // 5, 20)
        
        # Add some randomness for variety
        import random
        random_bonus = random.randint(5, 15)
        
        total_score = base_score + length_bonus + random_bonus
        return min(total_score, 100)

    def calculate_total_score(self, scores: List[int]) -> int:
        if not scores:
            return 0
        return sum(scores) // len(scores)

scoring_service = ScoringService()
