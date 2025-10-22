# src/backend/MMagentsschemas/EA_schemas.py
from pydantic import BaseModel
from typing import Optional

class EvaluationInput(BaseModel):
    true_answer: str             # The correct answer
    user_answer: str             # The user's provided answer
    give_feedback: bool = False  # Whether to also generate feedback for the Quiz Agent

class EvaluationOutput(BaseModel):
    # "1" if correct, "0" if incorrect
    evaluation: str              
    # Short learning tip 
    feedback: Optional[str]  
    # Only when give_feedback=True, 1-line summary for quiz agent   
    quiz_agent_feedback: Optional[str]  
