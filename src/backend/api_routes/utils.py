from pathlib import Path
import json
from typing import Dict, List, Optional

def init_learning_folders(n) -> Dict[str, Path]:
    # Get base directory
    BASE_DIR = Path(__file__).resolve().parents[n]
    MM_LEARNING_ROOT = BASE_DIR / "MMagent_learning"
    LEARNING_SKILLS_PATH = MM_LEARNING_ROOT / "learning_skills"
    GLOBAL_STATS_PATH = MM_LEARNING_ROOT / "global_stats.json"
    SKILLS_METADATA_PATH = MM_LEARNING_ROOT / "skills_metadata.json"
    # Ensure main folders exist
    MM_LEARNING_ROOT.mkdir(exist_ok=True)
    LEARNING_SKILLS_PATH.mkdir(exist_ok=True)
    # Initialize global_stats.json if it doesn't exist
    if not GLOBAL_STATS_PATH.exists():
        GLOBAL_STATS_PATH.write_text(
            json.dumps({
                "skills_mastered": 0,
                "current_skill_id": None
            }, indent=2),
            encoding="utf-8"
        )
    # Initialize skills_metadata.json if it doesn't exist
    if not SKILLS_METADATA_PATH.exists():
        SKILLS_METADATA_PATH.write_text(
            json.dumps({
                "total_skills": 0,
                "skills": []
            }, indent=2),
            encoding="utf-8"
        )
    return {
        "MM_LEARNING_ROOT": MM_LEARNING_ROOT,
        "LEARNING_SKILLS_PATH": LEARNING_SKILLS_PATH,
        "GLOBAL_STATS_PATH": GLOBAL_STATS_PATH,
        "SKILLS_METADATA_PATH": SKILLS_METADATA_PATH
    }

def get_all_skills(metadata_path: Path) -> List[Dict[str, str]]:
    """Get all available skills from the metadata file with mastery calculation."""
    try:
        # Get base directory from metadata path
        base_dir = metadata_path.parent
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        skills_list = []
        for skill in metadata["skills"]:
            # Read plan_config.json for this skill
            skill_folder = base_dir / "learning_skills" / skill["id"]
            plan_config = json.loads((skill_folder / "plan_config.json").read_text(encoding="utf-8"))
            # Calculate average mastery
            total_mastery = sum(topic.get("mastery", 0) for topic in plan_config["topics"])
            avg_mastery = round(total_mastery / len(plan_config["topics"]), 1) if plan_config["topics"] else 0
            skills_list.append({
                "skill_id": skill["id"],
                "name": skill["name"],
                "mastery": avg_mastery
            })
        return skills_list
    except Exception as e:
        print(f"Debug error: {str(e)}")
        raise Exception(f"Failed to fetch skills: {str(e)}")

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
            ({"name": topic["name"], "topic_id": topic["topic_id"]} 
             for topic in plan_config["topics"] 
             if topic["topic_id"] == current_topic_id),
            {"name": "No topic found", "topic_id": "none"}
        )
        return {
            "skill_name": skill_name,
            "current_topic": current_topic["name"],
            "current_topic_id": current_topic_id
        }
    except Exception as e:
        print(f"Error getting current topic: {e}")
        return {
            "skill_name": "Error loading skill",
            "current_topic": "Error loading topic",
            "current_topic_id": "error"
        }