# src/backend/fastapi/api_routes/planning_routes.py
import os
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from ..MMagents.planning_agent import PlanningAgent
from ..MMagents.schemas.PA_schemas import PlanOutput
from pydantic import BaseModel
from datetime import datetime
from typing import List

load_dotenv()
router = APIRouter()

# --- Request body schema ---
class CreateSkillPlanRequest(BaseModel):
    skill_name: str
    # e.g., difficulty, current mastery, learning style
    user_context: str  

# Add response model for skills
class SkillInfo(BaseModel):
    skill_id: str
    name: str

from ...utils import init_learning_folders, get_all_skills, set_current_skill

# Initialize learning folders and get paths
paths = init_learning_folders()
MM_LEARNING_ROOT = paths["MM_LEARNING_ROOT"]
LEARNING_SKILLS_PATH = paths["LEARNING_SKILLS_PATH"]
GLOBAL_STATS_PATH = paths["GLOBAL_STATS_PATH"]
SKILLS_METADATA_PATH = paths["SKILLS_METADATA_PATH"]

@router.post("/create-skill-plan")
def create_skill_plan(request: CreateSkillPlanRequest):
    """Create a new skill plan folder with plan_config.json and progress.json."""
    try:
        skill_name = request.skill_name.strip()
        user_context = request.user_context.strip()

        # --- Initialize PlanningAgent ---
        api_key = os.getenv("GEMINI_PRIMARY_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not found.")
        agent = PlanningAgent(api_key=api_key)
        
        # --- Generate plan ---
        plan_output: PlanOutput = agent.run(skill=skill_name, context=user_context)

        # --- Load or initialize metadata ---
        if SKILLS_METADATA_PATH.exists():
            metadata = json.loads(SKILLS_METADATA_PATH.read_text(encoding="utf-8"))
        else:
            metadata = {"total_skills": 0, "skills": []}

        # --- Create new skill folder ---
        new_skill_number = metadata["total_skills"] + 1
        skill_id = f"skill_{new_skill_number:03d}"
        skill_folder = LEARNING_SKILLS_PATH / skill_id
        skill_folder.mkdir(exist_ok=True)

        # --- Save plan_config.json with mastery fields ---
        plan_dict = plan_output.model_dump()
        for topic in plan_dict["topics"]:
            topic["mastery"] = 0  # Initialize mastery for each topic
        
        plan_config_path = skill_folder / "plan_config.json"
        plan_config_path.write_text(json.dumps(plan_dict, indent=2), encoding="utf-8")

        # --- Initialize progress.json ---
        progress_path = skill_folder / "progress.json"
        progress_path.write_text(json.dumps({"progress": []}, indent=2))

        # --- Update skills_metadata.json ---
        metadata["total_skills"] = new_skill_number
        metadata["skills"].append({
            "id": skill_id,
            "name": skill_name,
            "created_at": datetime.now().isoformat(),
            "topic_count": len(plan_output.topics),
            "status": "active"
        })
        SKILLS_METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

        return {
            "status": "success", 
            "skill_id": skill_id, 
            "topic_count": len(plan_output.topics),
            "is_active": True
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all-skills", response_model=List[SkillInfo])
def get_all_skills():
    """Get all available skills."""
    try:
        metadata = json.loads(SKILLS_METADATA_PATH.read_text(encoding="utf-8"))
        return [
            SkillInfo(skill_id=skill["id"], name=skill["name"])
            for skill in metadata["skills"]
        ]
    except Exception as e:
        print(f"Debug error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch skills: {str(e)}")

@router.post("/set-current-skill")
def update_current_skill(skill_id: str):
    """Set the current active skill."""
    success = set_current_skill(skill_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to set current skill")
    return {"status": "success", "current_skill_id": skill_id}


