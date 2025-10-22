# src/backend/MMagentsschemas/QA_schemas.py
from pydantic import BaseModel
from typing import Dict, List, Optional

class QuizQuestion(BaseModel):
    Q: str  # Question
    A: str  # Answer (brief)
    E: str  # Explanation (detailed)

class QuizInput(BaseModel):
    topic_name: str
    subtopic_name: str
    subtopic_description: str
    focus_areas: List[str]
    user_context: str
    current_mastery: int
    evaluator_feedback: Optional[str] = None

class QuizOutput(BaseModel):
    """Output schema containing 5 quiz questions"""
    questions: Dict[str, QuizQuestion]  # Keys are "1" through "5"