# src/backend/api_routes/chat_routes.py
import os
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from ..MMagents.chat_agent import ChatAgent
from pydantic import BaseModel

load_dotenv()
router = APIRouter()

# --- Request body schema ---
class ChatRequest(BaseModel):
    user_query: str
    skill_id: str = None  # Optional skill context

@router.post("/ask")
def ask_question(request: ChatRequest):
    """Ask a question to the AI tutor."""
    try:
        # Initialize ChatAgent
        api_key = os.getenv("GEMINI_PRIMARY_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not found.")
        
        agent = ChatAgent(api_key=api_key)
        
        # Generate response
        response = agent.run(user_query=request.user_query)
        
        return {
            "status": "success",
            "response": response,
            "user_query": request.user_query
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))