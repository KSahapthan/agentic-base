import React from 'react';
import './MentorMind.css';

const MentorMind = () => {
  return (
    <div className="mindmaster-container">
      {/* Left Section — Hint / Chat */}
      <div className="mindmaster-panel left-panel">
        <h2 className="panel-title">Hint / Chat</h2>
        <div className="panel-content">
          <p>Ask questions or get hints from the AI tutor here.</p>
          {/* Future: integrate chat component */}
        </div>
      </div>

      {/* Middle Section — Learn / Quiz */}
      <div className="mindmaster-panel middle-panel">
        <h2 className="panel-title">Learn / Quiz</h2>
        <div className="panel-content">
          <p>Interactive lessons and quizzes appear here.</p>
          {/* Future: interactive learning module */}
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
