from pathlib import Path
import json
from typing import Dict, List, Optional

def init_learning_folders() -> Dict[str, Path]:
    # Get base directory
    BASE_DIR = Path(__file__).resolve().parents[2]
    MM_LEARNING_ROOT = BASE_DIR / "MMagent_learning"
    LEARNING_SKILLS_PATH = MM_LEARNING_ROOT / "learning_skills"
    GLOBAL_STATS_PATH = MM_LEARNING_ROOT / "global_stats.json"
    SKILLS_METADATA_PATH = MM_LEARNING_ROOT / "skills_metadata.json"

    # Create main folders
    MM_LEARNING_ROOT.mkdir(exist_ok=True)
    LEARNING_SKILLS_PATH.mkdir(exist_ok=True)
    
    # Initialize global_stats.json if it doesn't exist
    if not GLOBAL_STATS_PATH.exists():
        GLOBAL_STATS_PATH.write_text(
            json.dumps({
                "skills_mastered": 0,
                "current_skill_id": None  # Add this field
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

def get_all_skills() -> List[Dict]:
    """Get all skills with their mastery levels."""
    paths = init_learning_folders()
    
    try:
        metadata = json.loads(paths["SKILLS_METADATA_PATH"].read_text(encoding="utf-8"))
        skills_list = []

        for skill in metadata["skills"]:
            skill_folder = paths["LEARNING_SKILLS_PATH"] / skill["id"]
            plan_config = json.loads((skill_folder / "plan_config.json").read_text(encoding="utf-8"))
            
            # Calculate overall mastery
            total_mastery = sum(topic.get("mastery", 0) for topic in plan_config["topics"])
            avg_mastery = total_mastery / len(plan_config["topics"]) if plan_config["topics"] else 0

            skills_list.append({
                "skill_id": skill["id"],
                "name": skill["name"],
                "mastery": round(avg_mastery, 1),
                "created_at": skill["created_at"],
                "topic_count": len(plan_config["topics"])
            })

        return skills_list
    except Exception as e:
        print(f"Error reading skills: {e}")
        return []

def set_current_skill(skill_id: Optional[str]) -> bool:
    """Update the current skill ID in global stats."""
    paths = init_learning_folders()
    
    try:
        stats = json.loads(paths["GLOBAL_STATS_PATH"].read_text(encoding="utf-8"))
        stats["current_skill_id"] = skill_id
        paths["GLOBAL_STATS_PATH"].write_text(json.dumps(stats, indent=2), encoding="utf-8")
        return True
    except Exception as e:
        print(f"Error setting current skill: {e}")
        return False