import React, { useState, useEffect } from 'react';
import ActionButtons from '../../components/MentorMind/ActionButtons';
import './MentorMind.css';

// define a functional React component
const MentorMind = () => {
  const [currentSkillId, setCurrentSkillId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved skill ID on mount (only once)
  useEffect(() => {
    const savedId = localStorage.getItem('currentSkillId');
    if (savedId) {
      setCurrentSkillId(savedId);
    }
    setIsLoading(false);
  }, []);

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
        <div className="panel-content">
          {currentSkillId ? (
            <div>
              <h3>Current Skill: {currentSkillId}</h3>
              <p>The interactive quizzing would be displayed here upon selection of a skill</p>
            </div>
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
