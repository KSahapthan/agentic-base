# src/backend/api_routes/database_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import json
from typing import Optional

from .utils import init_learning_folders

router = APIRouter(tags=["database"])

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
    correct_answers: int
    total_questions: int = 5

class UpdateTopicProgressRequest(BaseModel):
    skill_id: str
    topic_id: str
    subtopic_id: str

@router.post("/mark-subtopic-completed")
def mark_subtopic_completed(request: UpdateCompletionRequest):
    """Mark a subtopic as completed in plan_config.json"""
    try:
        skill_folder = LEARNING_SKILLS_PATH / request.skill_id
        plan_config_path = skill_folder / "plan_config.json"
        
        if not plan_config_path.exists():
            raise HTTPException(status_code=404, detail="Plan config not found for this skill.")
        
        # Load current plan config
        plan_config = json.loads(plan_config_path.read_text(encoding="utf-8"))
        
        print(f"DEBUG: Marking subtopic completed - Request: {request.model_dump()}")
        print(f"DEBUG: Available topics: {[t['topic_id'] for t in plan_config['topics']]}")
        
        # Find the topic and subtopic
        topic_found = False
        subtopic_found = False
        
        for topic in plan_config["topics"]:
            if topic["topic_id"] == request.topic_id:
                topic_found = True
                print(f"DEBUG: Found topic {request.topic_id}")
                if "subtopics" in topic:
                    print(f"DEBUG: Available subtopics: {[s['subtopic_id'] for s in topic['subtopics']]}")
                    for subtopic in topic["subtopics"]:
                        if subtopic["subtopic_id"] == request.subtopic_id:
                            subtopic["completed"] = True
                            subtopic_found = True
                            print(f"Marked subtopic {request.subtopic_id} as completed")
                            break
                break
        
        if not topic_found:
            raise HTTPException(status_code=404, detail=f"Topic {request.topic_id} not found.")
        
        if not subtopic_found:
            raise HTTPException(status_code=404, detail=f"Subtopic {request.subtopic_id} not found.")
        
        # Save updated plan config
        plan_config_path.write_text(json.dumps(plan_config, indent=2), encoding="utf-8")
        
        return {
            "status": "success",
            "message": f"Subtopic {request.subtopic_id} marked as completed"
        }
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON in plan config: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/update-subtopic-mastery")
def update_subtopic_mastery(request: UpdateMasteryRequest):
    """Update subtopic mastery using 0.3 weightage to existing mastery and 0.7 to current performance"""
    try:
        skill_folder = LEARNING_SKILLS_PATH / request.skill_id
        plan_config_path = skill_folder / "plan_config.json"
        
        if not plan_config_path.exists():
            raise HTTPException(status_code=404, detail="Plan config not found for this skill.")
        
        # Load current plan config
        plan_config = json.loads(plan_config_path.read_text(encoding="utf-8"))
        
        # Find the topic and subtopic
        topic_found = False
        subtopic_found = False
        
        for topic in plan_config["topics"]:
            if topic["topic_id"] == request.topic_id:
                topic_found = True
                if "subtopics" in topic:
                    for subtopic in topic["subtopics"]:
                        if subtopic["subtopic_id"] == request.subtopic_id:
                            # Calculate new mastery: 0.3 * existing + 0.7 * current performance
                            existing_mastery = subtopic.get("mastery", 0)
                            current_performance = request.correct_answers / request.total_questions
                            new_mastery = round(0.3 * existing_mastery + 0.7 * current_performance, 2)
                            
                            subtopic["mastery"] = new_mastery
                            subtopic_found = True
                            print(f"Updated mastery for {request.subtopic_id}: {existing_mastery} -> {new_mastery} (correct: {request.correct_answers}/{request.total_questions})")
                            break
                break
        
        if not topic_found:
            raise HTTPException(status_code=404, detail=f"Topic {request.topic_id} not found.")
        
        if not subtopic_found:
            raise HTTPException(status_code=404, detail=f"Subtopic {request.subtopic_id} not found.")
        
        # Save updated plan config
        plan_config_path.write_text(json.dumps(plan_config, indent=2), encoding="utf-8")
        
        return {
            "status": "success",
            "message": f"Subtopic {request.subtopic_id} mastery updated",
            "new_mastery": new_mastery,
            "correct_answers": request.correct_answers,
            "total_questions": request.total_questions
        }
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON in plan config: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get-subtopic-status/{skill_id}/{topic_id}/{subtopic_id}")
def get_subtopic_status(skill_id: str, topic_id: str, subtopic_id: str):
    """Get completion status and mastery for a specific subtopic"""
    try:
        skill_folder = LEARNING_SKILLS_PATH / skill_id
        plan_config_path = skill_folder / "plan_config.json"
        
        if not plan_config_path.exists():
            raise HTTPException(status_code=404, detail="Plan config not found for this skill.")
        
        # Load current plan config
        plan_config = json.loads(plan_config_path.read_text(encoding="utf-8"))
        
        # Find the topic and subtopic
        for topic in plan_config["topics"]:
            if topic["topic_id"] == topic_id:
                if "subtopics" in topic:
                    for subtopic in topic["subtopics"]:
                        if subtopic["subtopic_id"] == subtopic_id:
                            return {
                                "status": "success",
                                "completed": subtopic.get("completed", False),
                                "mastery": subtopic.get("mastery", 0),
                                "subtopic_name": subtopic.get("name", ""),
                                "subtopic_description": subtopic.get("description", "")
                            }
        
        raise HTTPException(status_code=404, detail=f"Subtopic {subtopic_id} not found.")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/update-topic-progress")
def update_topic_progress(request: UpdateTopicProgressRequest):
    """Update current topic and subtopic progress, move to next topic if all subtopics completed"""
    try:
        skill_folder = LEARNING_SKILLS_PATH / request.skill_id
        plan_config_path = skill_folder / "plan_config.json"
        
        if not plan_config_path.exists():
            raise HTTPException(status_code=404, detail="Plan config not found for this skill.")
        
        # Load current plan config
        plan_config = json.loads(plan_config_path.read_text(encoding="utf-8"))
        
        # Find current topic and check if all subtopics are completed
        current_topic = None
        current_topic_index = -1
        
        for i, topic in enumerate(plan_config["topics"]):
            if topic["topic_id"] == request.topic_id:
                current_topic = topic
                current_topic_index = i
                break
        
        if not current_topic:
            raise HTTPException(status_code=404, detail=f"Topic {request.topic_id} not found.")
        
        # Check if all subtopics in current topic are completed
        all_subtopics_completed = True
        if "subtopics" in current_topic:
            for subtopic in current_topic["subtopics"]:
                if not subtopic.get("completed", False):
                    all_subtopics_completed = False
                    break
        
        if all_subtopics_completed:
            # Move to next topic
            next_topic_index = current_topic_index + 1
            if next_topic_index < len(plan_config["topics"]):
                next_topic = plan_config["topics"][next_topic_index]
                plan_config["current_topic_id"] = next_topic["topic_id"]
                plan_config["current_subtopic_id"] = next_topic["subtopics"][0]["subtopic_id"] if next_topic.get("subtopics") else None
                print(f"Moved to next topic: {next_topic['topic_id']}")
            else:
                # All topics completed
                plan_config["current_topic_id"] = None
                plan_config["current_subtopic_id"] = None
                print("All topics completed!")
        else:
            # Move to next subtopic in current topic
            if "subtopics" in current_topic:
                current_subtopic_index = -1
                for i, subtopic in enumerate(current_topic["subtopics"]):
                    if subtopic["subtopic_id"] == request.subtopic_id:
                        current_subtopic_index = i
                        break
                
                if current_subtopic_index >= 0:
                    next_subtopic_index = current_subtopic_index + 1
                    if next_subtopic_index < len(current_topic["subtopics"]):
                        plan_config["current_subtopic_id"] = current_topic["subtopics"][next_subtopic_index]["subtopic_id"]
                        print(f"Moved to next subtopic: {plan_config['current_subtopic_id']}")
                    else:
                        # All subtopics in current topic completed, move to next topic
                        next_topic_index = current_topic_index + 1
                        if next_topic_index < len(plan_config["topics"]):
                            next_topic = plan_config["topics"][next_topic_index]
                            plan_config["current_topic_id"] = next_topic["topic_id"]
                            plan_config["current_subtopic_id"] = next_topic["subtopics"][0]["subtopic_id"] if next_topic.get("subtopics") else None
                            print(f"Moved to next topic: {next_topic['topic_id']}")
                        else:
                            plan_config["current_topic_id"] = None
                            plan_config["current_subtopic_id"] = None
                            print("All topics completed!")
        
        # Save updated plan config
        plan_config_path.write_text(json.dumps(plan_config, indent=2), encoding="utf-8")
        
        return {
            "status": "success",
            "current_topic_id": plan_config["current_topic_id"],
            "current_subtopic_id": plan_config["current_subtopic_id"],
            "all_topics_completed": plan_config["current_topic_id"] is None
        }
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON in plan config: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
