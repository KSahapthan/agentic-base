# src/backend/api_routes/utils.py
from pathlib import Path
import json
from typing import Dict, List, Optional

def get_existing_quiz(learning_skills_path: Path, skill_id: str, topic_id: str, subtopic_id: str) -> Optional[dict]:
    """Check if a quiz already exists for the given skill, topic, and subtopic"""
    try:
        quiz_path = learning_skills_path / skill_id / f"quiz_{topic_id}.json"
        if not quiz_path.exists():
            return None
        quiz_data = json.loads(quiz_path.read_text(encoding="utf-8"))
        # Extract numeric part from subtopic_id (e.g., "topic_001_sub_01" -> "1")
        subtopic_num = subtopic_id.split('_')[-1].lstrip('0')
        return quiz_data.get(subtopic_num)
    except (OSError, json.JSONDecodeError):
        return None

def init_learning_folders(n) -> Dict[str, Path]:
    """Initializes the learning environment folder structure setup"""
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
                "current_skill_id": "skill_000"
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

def get_all_skills_with_mastery(metadata_path: Path) -> List[Dict[str, float]]:
    """Get all available skills from the metadata file with mastery calculation"""
    try:
        base_dir = metadata_path.parent
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        skills_list = []
        for skill in metadata.get("skills", []):
            skill_folder = base_dir / "learning_skills" / skill["id"]
            plan_path = skill_folder / "plan_config.json"
            if not plan_path.exists():
                # Skip missing skills rather than failing entire call
                continue
            plan_config = json.loads(plan_path.read_text(encoding="utf-8"))
            topics = plan_config.get("topics", [])
            if not isinstance(topics, list):
                raise ValueError(f"Invalid topics format in {plan_path}")
            total_mastery = sum(t.get("mastery", 0) for t in topics)
            avg_mastery = round(total_mastery / len(topics), 1) if topics else 0.0
            skills_list.append({
                "skill_id": skill["id"],
                "name": skill.get("name", "Unnamed Skill"),
                "mastery": avg_mastery
            })
        return skills_list
    except (OSError, json.JSONDecodeError, ValueError) as e:
        raise RuntimeError(f"Failed to fetch skills: {e}") from e

def get_current_learning_context(learning_skills_path: Path, metadata_path: Path, skill_id: str) -> dict:
    """Get the current topic and subtopic names for a given skill."""
    try:
        # Load metadata and find skill
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        skill = next((s for s in metadata.get("skills", []) if s.get("id") == skill_id), None)
        skill_name = skill.get("name") if skill else "Unknown Skill"
        # Load skill plan configuration
        plan_path = learning_skills_path / skill_id / "plan_config.json"
        plan_config = json.loads(plan_path.read_text(encoding="utf-8"))
        current_topic_id = plan_config.get("current_topic_id")
        current_subtopic_id = plan_config.get("current_subtopic_id")
        # Find current topic
        topics = plan_config.get("topics", [])
        current_topic = next((t for t in topics if t.get("topic_id") == current_topic_id),None)
        current_topic_name = current_topic.get("name") if current_topic else "No topic found"
        # Find current subtopic
        current_subtopic_name = "No subtopic found"
        if current_topic and current_subtopic_id:
            subtopics = current_topic.get("subtopics", [])
            subtopic = next((st for st in subtopics if st.get("subtopic_id") == current_subtopic_id), None)
            if subtopic:
                current_subtopic_name = subtopic.get("name", current_subtopic_name)
        return {
            "skill_name": skill_name,
            "current_topic": current_topic_name,
            "current_topic_id": current_topic_id or "None",
            "current_subtopic_id": current_subtopic_id or "None",
            "current_subtopic_name": current_subtopic_name,
            "current_subtopic_index": (int(current_subtopic_id.split('_')[-1].lstrip('0'))-1),
            "focus_areas": current_topic.get("focus_areas", "") if current_topic else "",
            "current_subtopic_description": subtopic.get("description", "") if current_topic and subtopic else "",
            "user_context": skill.get("user_context", "") if skill else "No user context found"
        }
    except Exception as e:
        print(f"DEBUG: Error getting current topic details: {e}")
        return {
            "skill_name": "Error loading skill",
            "current_topic": "Error loading topic",
            "current_topic_id": "Error",
            "current_subtopic_id": "Error",
            "current_subtopic_name": "Error loading subtopic"
        }