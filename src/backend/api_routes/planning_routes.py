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

load_dotenv()
router = APIRouter()

# --- Request body schema ---
class CreateSkillPlanRequest(BaseModel):
    skill_name: str
    # e.g., difficulty, current mastery, learning style
    user_context: str  

# --- Paths ---
BASE_DIR = Path(__file__).resolve().parents[4]
MM_LEARNING_ROOT = BASE_DIR / "MMagent_learning"
USER_PROFILE_PATH = MM_LEARNING_ROOT / "user_profile.json"
GLOBAL_STATS_PATH = MM_LEARNING_ROOT / "global_stats.json"
LEARNING_SKILLS_PATH = MM_LEARNING_ROOT / "learning_skills"
SKILLS_METADATA_PATH = LEARNING_SKILLS_PATH / "skills_metadata.json"

# Ensure folders exist
MM_LEARNING_ROOT.mkdir(exist_ok=True)
LEARNING_SKILLS_PATH.mkdir(exist_ok=True)

@router.post("/create-skill-plan")
def create_skill_plan(request: CreateSkillPlanRequest):
    """Create a new skill plan folder with plan_config.json and progress.json."""
    try:
        skill_name = request.skill_name.strip()
        user_context = request.user_context.strip()

        # --- Load user profile ---
        if not USER_PROFILE_PATH.exists():
            raise HTTPException(status_code=400, detail="User profile not found.")
        user_profile = USER_PROFILE_PATH.read_text(encoding="utf-8")

        # --- Initialize PlanningAgent ---
        api_key = os.getenv("GEMINI_PRIMARY_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not found.")
        agent = PlanningAgent(api_key=api_key)
        
        # --- Generate plan ---
        plan_output: PlanOutput = agent.run(skill=skill_name, context=user_context)

        # --- Determine new skill folder ID ---
        if SKILLS_METADATA_PATH.exists():
            metadata = json.loads(SKILLS_METADATA_PATH.read_text(encoding="utf-8"))
        else:
            metadata = {"total_skills": 0, "active_skill_id": None, "skills": []}

        new_skill_number = metadata["total_skills"] + 1
        skill_id = f"skill_{new_skill_number:03d}"
        skill_folder = LEARNING_SKILLS_PATH / skill_id
        skill_folder.mkdir(exist_ok=True)

        # --- Save plan_config.json ---
        plan_config_path = skill_folder / "plan_config.json"
        plan_config_path.write_text(plan_output.model_dump_json(indent=2), encoding="utf-8")

        # --- Initialize progress.json ---
        progress_path = skill_folder / "progress.json"
        progress_path.write_text(json.dumps({"progress": []}, indent=2))

        # --- Update skills_metadata.json ---
        metadata["total_skills"] = new_skill_number
        metadata["active_skill_id"] = skill_id
        metadata["skills"].append({
            "id": skill_id,
            "name": skill_name,
            "created_at": datetime.now().isoformat(),
            "topic_count": len(plan_output.topics)
        })
        SKILLS_METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

        return {"status": "success", "skill_id": skill_id, "topic_count": len(plan_output.topics)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/current-skill-plan")
def get_current_skill_plan():
    """Return the active skill plan and ensure all topics have 'mastery' field."""
    if not SKILLS_METADATA_PATH.exists():
        raise HTTPException(status_code=404, detail="No skills metadata found.")
    
    metadata = json.loads(SKILLS_METADATA_PATH.read_text(encoding="utf-8"))
    current_skill_id = metadata.get("active_skill_id")
    if not current_skill_id:
        raise HTTPException(status_code=404, detail="No active skill plan found.")

    skill_folder = LEARNING_SKILLS_PATH / current_skill_id
    plan_config_path = skill_folder / "plan_config.json"
    if not plan_config_path.exists():
        raise HTTPException(status_code=404, detail="Plan config not found.")

    plan_config = json.loads(plan_config_path.read_text(encoding="utf-8"))
    for topic in plan_config.get("topics", []):
        if "mastery" not in topic:
            topic["mastery"] = 0

    return {"skill_id": current_skill_id, "topics": plan_config["topics"]}
