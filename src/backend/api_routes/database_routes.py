# src/backend/api_routes/database_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
from pathlib import Path
from .utils import init_learning_folders

router = APIRouter()

# Initialize learning folders and get paths
paths = init_learning_folders(3)
LEARNING_SKILLS_PATH = paths["LEARNING_SKILLS_PATH"]

class UpdateCompletionRequest(BaseModel):
    skill_id: str
    topic_id: str
    subtopic_id: str

class UpdateMasteryRequest(BaseModel):
    skill_id: str
    topic_id: str
    subtopic_id: str
    correct_answers: int = 0
    total_questions: int = 5

@router.post("/mark-subtopic-completed")
def mark_subtopic_completed(request: UpdateCompletionRequest):
    """
    Mark a subtopic as completed in plan_config.json.
    If all subtopics are done, mark topic as completed and move to the next topic
    """
    try:
        plan_config_path = LEARNING_SKILLS_PATH / request.skill_id / "plan_config.json"
        if not plan_config_path.exists():
            raise HTTPException(status_code=404, detail="Plan config not found for this skill.")
        plan_config = json.loads(plan_config_path.read_text(encoding="utf-8"))
        topics = plan_config.get("topics", [])
        topic_index = next((i for i, t in enumerate(topics) if t.get("topic_id") == request.topic_id), None)
        if topic_index is None:
            raise HTTPException(status_code=404, detail=f"Topic {request.topic_id} not found.")
        topic = topics[topic_index]
        subtopics = topic.get("subtopics", [])
        subtopic = next((st for st in subtopics if st.get("subtopic_id") == request.subtopic_id), None)
        if not subtopic:
            raise HTTPException(status_code=404, detail=f"Subtopic {request.subtopic_id} not found.")
        # Mark current subtopic completed
        subtopic["completed"] = True
        # If all subtopics done → mark topic completed
        if subtopics and all(st.get("completed") for st in subtopics):
            topic["completed"] = True
            # auto-average topic mastery if available
            topic["mastery"] = round(sum(st.get("mastery", 0) for st in subtopics) / len(subtopics), 2)
        # Move progress pointer
        # If there’s another subtopic in same topic → move there
        current_index = next((i for i, st in enumerate(subtopics) if st.get("subtopic_id") == request.subtopic_id), -1)
        if current_index + 1 < len(subtopics):
            plan_config["current_subtopic_id"] = subtopics[current_index + 1]["subtopic_id"]
        else:
            # if all subtopics done → move to next topic
            next_topic_index = topic_index + 1
            if next_topic_index < len(topics):
                next_topic = topics[next_topic_index]
                plan_config["current_topic_id"] = next_topic["topic_id"]
                plan_config["current_subtopic_id"] = (
                    next_topic["subtopics"][0]["subtopic_id"]
                    if next_topic.get("subtopics")
                    else None
                )
            else:
                # everything done
                plan_config["current_topic_id"] = None
                plan_config["current_subtopic_id"] = None
        # Save changes
        plan_config_path.write_text(json.dumps(plan_config, indent=2), encoding="utf-8")
        return {
            "status": "success",
            "message": f"Subtopic {request.subtopic_id} marked as completed.",
            "current_topic_id": plan_config["current_topic_id"],
            "current_subtopic_id": plan_config["current_subtopic_id"]
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON in plan config.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/update-subtopic-mastery")
def update_subtopic_mastery(request: UpdateMasteryRequest):
    """Update subtopic mastery: 30% previous score + 70% current performance"""
    try:
        plan_config_path = LEARNING_SKILLS_PATH / request.skill_id / "plan_config.json"
        if not plan_config_path.exists():
            raise HTTPException(status_code=404, detail="Plan config not found for this skill.")
        plan_config = json.loads(plan_config_path.read_text(encoding="utf-8"))
        # Find the topic
        topic = next((t for t in plan_config.get("topics", []) if t.get("topic_id") == request.topic_id), None)
        if not topic:
            raise HTTPException(status_code=404, detail=f"Topic {request.topic_id} not found.")
        # Find the subtopic
        subtopic = next((st for st in topic.get("subtopics", []) if st.get("subtopic_id") == request.subtopic_id), None)
        if not subtopic:
            raise HTTPException(status_code=404, detail=f"Subtopic {request.subtopic_id} not found.")
        # Update mastery
        existing = subtopic.get("mastery", 0)
        performance = request.correct_answers / request.total_questions
        new_mastery = round(0.3 * existing + 0.7 * performance, 2)
        subtopic["mastery"] = new_mastery
        # Recalculate topic mastery as average of subtopics
        subtopics = topic.get("subtopics", [])
        if subtopics:
            topic["mastery"] = round(sum(st.get("mastery", 0) for st in subtopics) / len(subtopics),2)
        # Save file
        plan_config_path.write_text(json.dumps(plan_config, indent=2), encoding="utf-8")
        return {
            "status": "success",
            "message": f"Subtopic {request.subtopic_id} mastery updated",
            "new_mastery": new_mastery
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON in plan config.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
