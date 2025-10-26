# src/backend/fastapi/api_routes/planning_routes.py
import os
import json
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from ..MMagents.planning_agent import PlanningAgent
from ..MMagents.schemas.PA_schemas import PlanOutput
from pydantic import BaseModel
from datetime import datetime
from typing import List
from pathlib import Path
from .utils import init_learning_folders, get_all_skills, get_current_topic_name

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
    mastery: float

# Initialize learning folders and get paths
paths = init_learning_folders(3)
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
        api_key = os.getenv("GEMINI_PRIMARY_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not found.")
        agent = PlanningAgent(api_key=api_key)
        plan_output: PlanOutput = agent.run(skill=skill_name, context=user_context)
        if SKILLS_METADATA_PATH.exists():
            metadata = json.loads(SKILLS_METADATA_PATH.read_text(encoding="utf-8"))
        else:
            metadata = {"total_skills": 0, "skills": []}
        # --- Create new skill folder ---
        new_skill_number = metadata["total_skills"] + 1
        skill_id = f"skill_{new_skill_number:03d}"
        skill_folder = LEARNING_SKILLS_PATH / skill_id
        skill_folder.mkdir(exist_ok=True)
        print(f"Created skill folder: {skill_folder}")
        # --- Save plan_config.json with mastery fields and topic IDs ---
        plan_dict = plan_output.model_dump()
        # Add topic IDs and initialize mastery
        for index, topic in enumerate(plan_dict["topics"]):
            topic_id = f"topic_{index + 1:03d}"  # e.g., topic_001, topic_002
            topic.update({
                "topic_id": topic_id,
                "order": index + 1,
                "mastery": 0,
                "completed": False
            })
            # Add IDs to subtopics if they exist
            if "subtopics" in topic:
                for sub_index, subtopic in enumerate(topic["subtopics"]):
                    subtopic_id = f"{topic_id}_sub_{sub_index + 1:02d}"  # e.g., topic_001_sub_01
                    subtopic.update({
                        "subtopic_id": subtopic_id,
                        "order": sub_index + 1,
                        "completed": False,
                        "mastery": 0
                    })
        # Add metadata about topics structure
        plan_dict.update({
            "total_topics": len(plan_dict["topics"]),
            "current_topic_id": plan_dict["topics"][0]["topic_id"] if plan_dict["topics"] else None,
            "current_subtopic_id": plan_dict["topics"][0]["subtopics"][0]["subtopic_id"] if plan_dict["topics"] and plan_dict["topics"][0].get("subtopics") else None,
            "overall_progress": 0
        })
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
def get_skills():
    """Get all available skills."""
    try:
        skills = get_all_skills(SKILLS_METADATA_PATH)
        return [SkillInfo(**skill) for skill in skills]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/skill-details/{skill_id}")
def get_skill_info(skill_id: str):
    """Get skill name and current topic."""
    details = get_current_topic_name(LEARNING_SKILLS_PATH, SKILLS_METADATA_PATH, skill_id)
    return details

@router.get("/get-topic-data/{skill_id}/{topic_id}")
def get_topic_data(skill_id: str, topic_id: str):
    """Get topic data including subtopics from plan_config.json."""
    try:
        skill_folder = LEARNING_SKILLS_PATH / skill_id
        plan_config_path = skill_folder / "plan_config.json"
        if not plan_config_path.exists():
            raise HTTPException(status_code=404, detail="Plan config not found for this skill.")
        plan_config = json.loads(plan_config_path.read_text(encoding="utf-8"))
        # Find the topic by topic_id
        topic = next((t for t in plan_config["topics"] if t["topic_id"] == topic_id), None)
        if not topic:
            raise HTTPException(status_code=404, detail=f"Topic {topic_id} not found.")
        return {
            "status": "success",
            "topic": topic,
            "subtopics": topic.get("subtopics", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_current_topic_name(learning_skills_path: Path, metadata_path: Path, skill_id: str) -> dict:
    """Get the current topic name and skill name for a given skill."""
    try:
        # Read metadata to get skill name
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        skill = next((s for s in metadata["skills"] if s["id"] == skill_id), None)
        skill_name = skill["name"] if skill else "Unknown Skill"
        # Read plan config
        plan_config = json.loads(
            (learning_skills_path / skill_id / "plan_config.json").read_text(encoding="utf-8")
        )
        # Get current topic ID and name
        current_topic_id = plan_config["current_topic_id"]
        current_topic = next(
            (topic["name"] for topic in plan_config["topics"] 
             if topic["topic_id"] == current_topic_id),
            "No topic found"
        )
        return {
            "skill_name": skill_name,
            "current_topic": current_topic,
            "current_topic_id": current_topic_id
        }
    except Exception as e:
        print(f"Error getting current topic: {e}")
        return {
            "skill_name": "Error loading skill",
            "current_topic": "Error loading topic",
            "current_topic_id": "Error loading topic ID"
        }



