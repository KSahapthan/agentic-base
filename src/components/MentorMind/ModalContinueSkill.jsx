// src/components/MentorMind/ModalContinueSkill.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Modal.css';

const ModalContinueSkill = ({ onClose, onSkillSelect, currentSkillId }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/plan/all-skills');
        setSkills(res.data);
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError('Failed to load skills');
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const handleSelectSkill = (skillId) => {
    // Debug log
    console.log('Selected skill:', skillId); 
    onSkillSelect(skillId);
    onClose();
  };

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Loading skills...</h3>
      </div>
    </div>
  );

  if (error) return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );

  if (!skills.length) return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>No Skills Found</h3>
        <p>Create a new skill to get started!</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Select a Skill</h3>
        <table className="skills-table">
          <thead>
            <tr>
              <th>Skill Name</th>
              <th>ID</th>
              <th>Mastery</th>
            </tr>
          </thead>
          <tbody>
            {skills.map(skill => (
              <tr 
                key={skill.skill_id}
                onClick={() => handleSelectSkill(skill.skill_id)}
                className={`skill-row ${skill.skill_id === currentSkillId ? 'active' : ''}`}
              >
                <td>{skill.name}</td>
                <td>{skill.skill_id}</td>
                <td>{skill.mastery}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ModalContinueSkill;
