# src/backend/MMagentsschemas/EA_schemas.py
from pydantic import BaseModel
from typing import Optional

class EvaluationInput(BaseModel):
    true_answer: str            
    user_answer: str 
    # Whether to also generate feedback for the Quiz Agent            
    give_feedback: bool = False  

class EvaluationOutput(BaseModel):
    # "1" if correct, "0" if incorrect
    evaluation: str              
    # Short learning tip 
    feedback: Optional[str]  
    # Only when give_feedback=True, 1-line summary for quiz agent   
    quiz_agent_feedback: Optional[str]  
