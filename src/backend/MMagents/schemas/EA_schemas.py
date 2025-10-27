# src/backend/MMagents/schemas/EA_schemas.py
from pydantic import BaseModel
from typing import Optional

class EvaluationInput(BaseModel):
    true_answer: str            
    user_answer: str          
    give_feedback: bool = False  

class EvaluationOutput(BaseModel):
    evaluation: str              
    feedback: Optional[str]  
    quiz_agent_feedback: Optional[str]  
