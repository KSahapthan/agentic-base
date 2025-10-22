import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionButtons from '../../components/MentorMind/ActionButtons';
import './MentorMind.css';

// define a functional React component
const MentorMind = () => {
  const [currentSkillId, setCurrentSkillId] = useState(null);
  const [skillDetails, setSkillDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved skill ID on mount (only once)
  useEffect(() => {
    const savedId = localStorage.getItem('currentSkillId');
    if (savedId) {
      setCurrentSkillId(savedId);
    }
    setIsLoading(false);
  }, []);

  // Fetch current topic when skill changes
  useEffect(() => {
    if (!currentSkillId) {
      setSkillDetails(null);
      return;
    }

    const fetchCurrentTopic = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/plan/skill-details/${currentSkillId}`);
        setSkillDetails(response.data);
      } catch (err) {
        console.error('Error fetching current topic:', err);
        setSkillDetails({
          skill_name: 'Error loading skill',
          current_topic: 'Error loading topic',
          current_topic_id: 'Error loading topic ID'
        });
      }
    };
    fetchCurrentTopic();
  }, [currentSkillId]);

  // Handler to update skill ID
  const handleSkillChange = (skillId) => {
    // Debug log
    console.log('Updating skill ID to:', skillId); 
    setCurrentSkillId(skillId);
    if (skillId) {
      localStorage.setItem('currentSkillId', skillId);
    } else {
      localStorage.removeItem('currentSkillId');
    }
  };

  // Add effect to monitor state changes
  useEffect(() => {
    console.log('Current skill ID changed to:', currentSkillId);
  }, [currentSkillId]);

  if (isLoading) {
    return (
      <div className="mentormind-container loading">
        <div>Loading your learning progress...</div>
      </div>
    );
  }

  return (
    <div className="mentormind-container">
      {/* Left Section — Hint / Chat */}
      <div className="mentormind-panel left-panel">
        <h2 className="panel-title">Hint (or) Chat</h2>
        <ActionButtons 
          onSkillSelect={handleSkillChange}
          currentSkillId={currentSkillId}
        />
        <div className="panel-content">
          <p>Ask questions or get hints from the AI tutor here</p>
        </div>
      </div>

      {/* Middle Section — Learn / Quiz */}
      <div className="mentormind-panel middle-panel">
        <h2 className="panel-title">Learn (or) Quiz</h2>
        {currentSkillId && skillDetails && (
          <div className="current-skill-info">
            <span className="skill-id">{currentSkillId}</span>
            <span className="separator">•</span>
            <span className="skill-name">{skillDetails.skill_name}</span>
            <span className="separator">•</span>
            <span className="topic-id">{skillDetails.current_topic_id}</span>
            <span className="separator">•</span>
            <span className="topic-name">{skillDetails.current_topic}</span>
          </div>
        )}
        <div className="panel-content">
          {currentSkillId ? (
            <p>The interactive quizzing would be displayed here upon selection of a skill</p>
          ) : (
            <p>Select an existing skill or create a skill to start learning</p>
          )}
        </div>
      </div>

      {/* Right Section — Feedback / Explanations */}
      <div className="mentormind-panel right-panel">
        <h2 className="panel-title">Feedback (or) Answers</h2>
        <div className="panel-content">
          <p>AI feedback and explanations will be displayed here</p>
          {/* Future: agent-generated insights */}
        </div>
      </div>
    </div>
  );
};

export default MentorMind;
