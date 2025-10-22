# src/backend/api_routes/quiz_routes.py
import os
import json
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from ..MMagents.quiz_agent import QuizAgent
from ..MMagents.schemas.QA_schemas import QuizInput, QuizOutput
from pydantic import BaseModel
from pathlib import Path

load_dotenv()
router = APIRouter()

# --- Request body schema ---
class GenerateQuizRequest(BaseModel):
    skill_id: str
    topic_id: str
    subtopic_name: str
    subtopic_description: str
    focus_areas: list[str]
    user_context: str = ""
    current_mastery: int = 50
    evaluator_feedback: str = None

class GetQuizRequest(BaseModel):
    skill_id: str
    question_number: int = 1

from .utils import init_learning_folders

# Initialize learning folders and get paths
paths = init_learning_folders(3)
MM_LEARNING_ROOT = paths["MM_LEARNING_ROOT"]
LEARNING_SKILLS_PATH = paths["LEARNING_SKILLS_PATH"]

@router.post("/generate-quiz")
def generate_quiz(request: GenerateQuizRequest):
    """Generate 5 quiz questions for a specific subtopic."""
    try:
        # Initialize QuizAgent
        api_key = os.getenv("GEMINI_PRIMARY_KEY")
        if not api_key:
            print("ERROR: GEMINI_PRIMARY_KEY not found in environment variables")
            raise HTTPException(status_code=500, detail="Gemini API key not found. Please check your .env file.")
        
        print(f"DEBUG: API key found, length: {len(api_key)}")
        agent = QuizAgent(api_key=api_key)
        
        # Create quiz input
        quiz_input = QuizInput(
            topic_name=request.topic_id,  # Using topic_id as topic_name for now
            subtopic_name=request.subtopic_name,
            subtopic_description=request.subtopic_description,
            focus_areas=request.focus_areas,
            user_context=request.user_context,
            current_mastery=request.current_mastery,
            evaluator_feedback=request.evaluator_feedback
        )
        
        # Generate quiz
        print(f"DEBUG: Generating quiz for topic: {request.topic_id}")
        quiz_output: QuizOutput = agent.run(quiz_input)
        print(f"DEBUG: Quiz generated successfully, questions: {len(quiz_output.questions)}")
        
        # Save quiz to skill folder for persistence
        skill_folder = LEARNING_SKILLS_PATH / request.skill_id
        skill_folder.mkdir(exist_ok=True)  # Ensure folder exists
        quiz_path = skill_folder / f"quiz_{request.topic_id}.json"
        quiz_path.write_text(json.dumps(quiz_output.model_dump(), indent=2), encoding="utf-8")
        print(f"DEBUG: Quiz saved to: {quiz_path}")
        
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
    """Get a specific question from the saved quiz."""
    try:
        # Load quiz data from file
        skill_folder = LEARNING_SKILLS_PATH / request.skill_id
        quiz_files = list(skill_folder.glob("quiz_*.json"))
        
        if not quiz_files:
            raise HTTPException(status_code=404, detail="No quiz found for this skill.")
        
        # Load the first quiz file (assuming one quiz per skill for now)
        quiz_path = quiz_files[0]
        quiz_data = json.loads(quiz_path.read_text(encoding="utf-8"))
        
        question_index = request.question_number - 1  # Convert to 0-based index
        if question_index < 0 or question_index >= len(quiz_data["questions"]):
            raise HTTPException(status_code=404, detail=f"Question {request.question_number} not found.")
        
        question = quiz_data["questions"][question_index]
        
        return {
            "status": "success",
            "question": question,
            "question_number": request.question_number,
            "total_questions": len(quiz_data["questions"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
