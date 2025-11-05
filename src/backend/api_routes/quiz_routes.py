# src/backend/api_routes/quiz_routes.py
import os
import json
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from ..MMagents.quiz_agent import QuizAgent
from ..MMagents.schemas.QA_schemas import QuizInput, QuizOutput
from pydantic import BaseModel
from typing import Optional
from pathlib import Path
from .utils import init_learning_folders, get_existing_quiz

load_dotenv()
router = APIRouter()

# Request body schema 
class GenerateQuizRequest(BaseModel):
    skill_id: str
    topic_id: str
    subtopic_id: str  
    subtopic_name: str
    subtopic_description: Optional[str] = None
    focus_areas: list[str]
    user_context: str = ""
    current_mastery: float = 0.0
    evaluator_feedback: str | None = None

class GetQuizRequest(BaseModel):
    skill_id: str
    topic_id: str
    subtopic_id: str
    question_number: int = 1

# Helper Functions 
def load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"Invalid JSON format in {path.name}")
def save_json(path: Path, data: dict):
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")

# Initialize learning folders and get paths
paths = init_learning_folders(3)
MM_LEARNING_ROOT = paths["MM_LEARNING_ROOT"]
LEARNING_SKILLS_PATH = paths["LEARNING_SKILLS_PATH"]

@router.post("/generate-quiz")
def generate_quiz(request: GenerateQuizRequest):
    """Generate 5 quiz questions for a specific subtopic."""
    try:
        # Extract numeric part from subtopic_id for storage
        subtopic_num = request.subtopic_id.split('_')[-1].lstrip('0')
        # Check if quiz already exists
        existing_quiz = get_existing_quiz(
            LEARNING_SKILLS_PATH,
            request.skill_id,
            request.topic_id,
            request.subtopic_id
        )
        if existing_quiz:
            return {
                "status": "success",
                "quiz_data": existing_quiz["quiz_data"],
                "skill_id": request.skill_id,
                "topic_id": request.topic_id
            }
        # Initialize API + Agent
        api_key = os.getenv("GEMINI_PRIMARY_KEY")
        if not api_key:
            print("ERROR: GEMINI_PRIMARY_KEY not found in environment variables")
            raise HTTPException(status_code=500, detail="Gemini API key not found. Please check your .env file.")
        agent = QuizAgent(api_key=api_key)
        # Create Quiz Input 
        quiz_input = QuizInput(
            topic_name=request.topic_id,
            subtopic_name=request.subtopic_name,
            subtopic_description=request.subtopic_description,
            focus_areas=request.focus_areas,
            user_context=request.user_context,
            current_mastery=request.current_mastery,
            evaluator_feedback=request.evaluator_feedback
        )
        # Generate Quiz
        quiz_output: QuizOutput = agent.run(quiz_input)
        # Save Quiz to File
        skill_folder = LEARNING_SKILLS_PATH / request.skill_id
        skill_folder.mkdir(exist_ok=True)
        quiz_path = skill_folder / f"quiz_{request.topic_id}.json"
        quiz_data = load_json(quiz_path)
        quiz_data[subtopic_num] = {
            "subtopic_name": request.subtopic_name,
            "subtopic_description": request.subtopic_description,
            "quiz_data": quiz_output.model_dump()
        }
        save_json(quiz_path, quiz_data)
        # Return Response
        return {
            "status": "success",
            "quiz_data": quiz_output.model_dump(),
            "skill_id": request.skill_id,
            "topic_id": request.topic_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get-question")
def get_question(request: GetQuizRequest):
    try:
        # Extract numeric part from subtopic_id
        existing_quiz = get_existing_quiz(
            LEARNING_SKILLS_PATH,
            request.skill_id,
            request.topic_id,
            request.subtopic_id
        )
        if not existing_quiz:
            raise HTTPException(
                status_code=404,
                detail=f"No quiz found for topic '{request.topic_id}' and subtopic '{request.subtopic_id}'."
            )
        # Extract question data 
        questions = existing_quiz["quiz_data"].get("questions", [])
        if not questions:
            raise HTTPException(
                status_code=404,
                detail=f"No questions available for subtopic '{request.subtopic_id}'."
            )
        question_index = request.question_number - 1  
        if question_index < 0 or question_index >= len(questions):
            raise HTTPException(
                status_code=404,
                detail=f"Question {request.question_number} out of range for subtopic '{request.subtopic_id}'."
            )
        question = questions[question_index]
        return {
            "status": "success",
            "question": question,
            "question_number": request.question_number,
            "total_questions": len(questions),
            "subtopic_name": existing_quiz.get("subtopic_name", ""),
            "subtopic_id": request.subtopic_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


