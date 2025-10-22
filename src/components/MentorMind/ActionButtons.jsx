// src/components/MentorMind/ActionButtons.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './ActionButtons.css';
import ModalNewSkill from './ModalNewSkill.jsx';
import ModalContinueSkill from './ModalContinueSkill.jsx';

const ActionButtons = ({ onSkillSelect, currentSkillId }) => {
  const [showNewSkillModal, setShowNewSkillModal] = useState(false);
  const [showContinueSkillModal, setShowContinueSkillModal] = useState(false);

  return (
    <>
      <div className="action-buttons-grid">
        <button className="action-btn" onClick={() => setShowNewSkillModal(true)}>
          New Skill
        </button>
        <button className="action-btn" onClick={() => setShowContinueSkillModal(true)}>
          Continue Skill
        </button>
        <button className="action-btn">Explore</button>
        <button className="action-btn">Quick Check</button>
      </div>

      {showNewSkillModal && ReactDOM.createPortal(
        <ModalNewSkill 
          onClose={() => setShowNewSkillModal(false)}
          onSkillSelect={onSkillSelect}
        />,
        document.body
      )}
      {showContinueSkillModal && ReactDOM.createPortal(
        <ModalContinueSkill 
          onClose={() => setShowContinueSkillModal(false)}
          onSkillSelect={onSkillSelect}
          currentSkillId={currentSkillId}
        />,
        document.body
      )}
    </>
  );
};

export default ActionButtons;
