# src/backend/MMagents/schemas/QA_schemas.py
from pydantic import BaseModel
from typing import List, Optional

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
    current_mastery: float
    evaluator_feedback: Optional[str] = None

class QuizOutput(BaseModel):
    """Output schema containing x quiz questions"""
    questions: List[QuizQuestion]  