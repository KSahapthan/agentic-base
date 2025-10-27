// src/components/MentorMind/ModalNewSkill.jsx
import React, { useState } from 'react';
import './Modal.css';
import axios from 'axios';

const ModalNewSkill = ({ onClose, onSkillSelect }) => {
  const [skillName, setSkillName] = useState('');
  const [target, setTarget] = useState('');
  const [style, setStyle] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const context = JSON.stringify({
        target,
        style,
        level
      });
      const res = await axios.post('http://127.0.0.1:8000/plan/create-skill-plan', 
        {
          skill_name: skillName,
          user_context: context
        }
      );
      console.log('Plan created:', res.data);
      onSkillSelect(res.data.skill_id);
      onClose();
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      alert('Error generating skill plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Create New Skill</h3>
        <input type="text" placeholder="Skill to learn" value={skillName} onChange={e => setSkillName(e.target.value)} />
        <input type="text" placeholder="Why to learn / Target" value={target} onChange={e => setTarget(e.target.value)} />
        <input type="text" placeholder="Preferred style/speed" value={style} onChange={e => setStyle(e.target.value)} />
        <input type="text" placeholder="Current level" value={level} onChange={e => setLevel(e.target.value)} />
        <div className="modal-actions">
          <button onClick={handleSubmit} disabled={loading}>{loading ? 'Generating...' : 'Create Plan'}</button>
          <button onClick={onClose} className="secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ModalNewSkill;
