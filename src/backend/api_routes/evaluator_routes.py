# src/backend/api_routes/evaluator_routes.py
import os
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from ..MMagents.evaluator_agent import EvaluatorAgent
from ..MMagents.schemas.EA_schemas import EvaluationInput, EvaluationOutput
from pydantic import BaseModel

load_dotenv()
router = APIRouter()

# Request body schema 
class EvaluateAnswerRequest(BaseModel):
    true_answer: str
    user_answer: str
    give_feedback: bool = False

@router.post("/evaluate")
def evaluate_answer(request: EvaluateAnswerRequest):
    """Evaluate user's answer against the correct answer."""
    try:
        api_key = os.getenv("GEMINI_PRIMARY_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not found.")
        agent = EvaluatorAgent(api_key=api_key)
        eval_input = EvaluationInput(
            true_answer=request.true_answer,
            user_answer=request.user_answer,
            give_feedback=request.give_feedback
        )
        eval_output: EvaluationOutput = agent.run(eval_input)
        return {
            "status": "success",
            "evaluation": eval_output.model_dump(),
            "is_correct": eval_output.evaluation == "1"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
