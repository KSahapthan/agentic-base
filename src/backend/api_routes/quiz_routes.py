# src/backend/api_routes/quiz_routes.py
import os
import json
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from ..MMagents.quiz_agent import QuizAgent
from ..MMagents.schemas.QA_schemas import QuizInput, QuizOutput
from pydantic import BaseModel
from pathlib import Path
from .utils import init_learning_folders, get_existing_quiz

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
    current_mastery: int = 0.3
    evaluator_feedback: str = None

class GetQuizRequest(BaseModel):
    skill_id: str
    topic_id: str
    subtopic_index: int = 1
    question_number: int = 1

# Initialize learning folders and get paths
paths = init_learning_folders(3)
MM_LEARNING_ROOT = paths["MM_LEARNING_ROOT"]
LEARNING_SKILLS_PATH = paths["LEARNING_SKILLS_PATH"]

@router.post("/generate-quiz")
def generate_quiz(request: GenerateQuizRequest):
    """Generate 5 quiz questions for a specific subtopic."""
    try:
        # First check if quiz already exists for this subtopic
        existing_quiz = get_existing_quiz(LEARNING_SKILLS_PATH, request.skill_id, request.topic_id, "1")
        if existing_quiz:
            print(f"DEBUG: Found existing quiz for skill {request.skill_id}, topic {request.topic_id}")
            return {
                "status": "success",
                "quiz_data": existing_quiz["quiz_data"],
                "skill_id": request.skill_id,
                "topic_id": request.topic_id
            }
        # If no existing quiz, generate new one
        api_key = os.getenv("GEMINI_PRIMARY_KEY")
        if not api_key:
            print("ERROR: GEMINI_PRIMARY_KEY not found in environment variables")
            raise HTTPException(status_code=500, detail="Gemini API key not found. Please check your .env file.")
        agent = QuizAgent(api_key=api_key)
        # Create quiz input
        quiz_input = QuizInput(
            topic_name=request.topic_id,  
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
        # Load existing quiz data or create new structure
        if quiz_path.exists():
            existing_data = json.loads(quiz_path.read_text(encoding="utf-8"))
        else:
            existing_data = {}
        # Find the next subtopic index
        subtopic_index = 1
        while str(subtopic_index) in existing_data:
            subtopic_index += 1
        # Store quiz data with subtopic index as key
        existing_data[str(subtopic_index)] = {
            "subtopic_name": request.subtopic_name,
            "subtopic_description": request.subtopic_description,
            "quiz_data": quiz_output.model_dump()
        }
        quiz_path.write_text(json.dumps(existing_data, indent=2), encoding="utf-8")
        print(f"DEBUG: Quiz saved to: {quiz_path} with subtopic index: {subtopic_index}")
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
        quiz_path = skill_folder / f"quiz_{request.topic_id}.json"
        if not quiz_path.exists():
            raise HTTPException(status_code=404, detail=f"No quiz found for topic {request.topic_id}.")
        quiz_data = json.loads(quiz_path.read_text(encoding="utf-8"))
        # Get the specific subtopic data
        subtopic_key = str(request.subtopic_index)
        if subtopic_key not in quiz_data:
            raise HTTPException(status_code=404, detail=f"Subtopic {request.subtopic_index} not found for topic {request.topic_id}.")
        subtopic_data = quiz_data[subtopic_key]
        questions = subtopic_data["quiz_data"]["questions"] 
        question_index = request.question_number - 1  # Convert to 0-based index
        if question_index < 0 or question_index >= len(questions):
            raise HTTPException(status_code=404, detail=f"Question {request.question_number} not found for subtopic {request.subtopic_index}.")
        question = questions[question_index]
        return {
            "status": "success",
            "question": question,
            "question_number": request.question_number,
            "total_questions": len(questions),
            "subtopic_name": subtopic_data["subtopic_name"],
            "subtopic_index": request.subtopic_index
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
