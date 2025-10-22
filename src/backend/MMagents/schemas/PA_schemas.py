# src/backend/schemas/PA_schemas.py
from pydantic import BaseModel
from typing import List, Optional

class Subtopic(BaseModel):
    name: str
    description: Optional[str] = None

class ConceptTopic(BaseModel):
    name: str
    description: str
    subtopics: List[Subtopic]
    difficulty: str  
    suggested_time: str  
    focus_areas: List[str]  

class PlanOutput(BaseModel):
    skill: str
    topics: List[ConceptTopic]
