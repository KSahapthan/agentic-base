import React, { useState, useEffect } from 'react';
import ActionButtons from '../../components/MentorMind/ActionButtons';
import './MentorMind.css';

const MentorMind = () => {
  const [currentSkillId, setCurrentSkillId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved skill ID on mount
  useEffect(() => {
    const savedId = localStorage.getItem('currentSkillId');
    if (savedId) {
      setCurrentSkillId(savedId);
    }
    setIsLoading(false);
  }, []);

  // Handler to update skill ID
  const handleSkillChange = (skillId) => {
    console.log('Updating skill ID to:', skillId); // Debug log
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
      <div className="mindmaster-container loading">
        <div>Loading your learning progress...</div>
      </div>
    );
  }

  return (
    <div className="mindmaster-container">
      {/* Left Section — Hint / Chat */}
      <div className="mindmaster-panel left-panel">
        <h2 className="panel-title">Hint / Chat</h2>
        <ActionButtons 
          onSkillSelect={handleSkillChange}
          currentSkillId={currentSkillId}
        />
        <div className="panel-content">
          <p>Ask questions or get hints from the AI tutor here.</p>
        </div>
      </div>

      {/* Middle Section — Learn / Quiz */}
      <div className="mindmaster-panel middle-panel">
        <h2 className="panel-title">Learn / Quiz</h2>
        <div className="panel-content">
          {currentSkillId ? (
            <div>
              <h3>Current Skill: {currentSkillId}</h3>
              <p>Topics list will be implemented soon.</p>
            </div>
          ) : (
            <p>Select or create a skill to start learning</p>
          )}
        </div>
      </div>

      {/* Right Section — Feedback / Explanations */}
      <div className="mindmaster-panel right-panel">
        <h2 className="panel-title">Feedback / Explanations</h2>
        <div className="panel-content">
          <p>AI feedback and explanations will be displayed here.</p>
          {/* Future: agent-generated insights */}
        </div>
      </div>
    </div>
  );
};

export default MentorMind;
