from typing import List

class ResumeParser:
    def extract_skills(self, filename: str) -> List[str]:
        # Mock skill extraction based on filename
        # In a real implementation, this would parse the actual resume
        mock_skills = [
            "JavaScript",
            "React",
            "Python",
            "FastAPI",
            "SQL",
            "Git",
            "Docker",
            "AWS",
            "TypeScript",
            "Node.js"
        ]
        
        # Return a subset of skills
        return mock_skills[:5]

resume_parser = ResumeParser()
