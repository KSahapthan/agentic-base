// src/components/Nav/Nav.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Nav.css';
import CodeExplorerIcon from '../../assets/CodeExplorer-button-1.png';
import MentorMindIcon from '../../assets/MentorMind-button-1.png';
import SettingsIcon from '../../assets/settings-1.png';
import HelpIcon from '../../assets/help-1.png';
import ProfileIcon from '../../assets/profile-1.png';

// Small reusable component for icon + label
const IconButton = ({ src, alt, label, onClick }) => (
  <div className="icon-wrapper">
    <button className="icon-btn" onClick={onClick}>
      <img 
        src={src} 
        alt={alt} 
        className="nav-icon" />
    </button>
    <span className="icon-label">{label}</span>
  </div>
);

const Nav = () => {
  // Left section icons
  const leftIcons = [
    { src: MentorMindIcon, alt: 'MentorMind', label: 'MentorMind' },
    { src: CodeExplorerIcon, alt: 'CodeExplorer', label: 'CodeExplorer' },
  ];

  // Right section icons
  const rightIcons = [
    { src: SettingsIcon, alt: 'Settings', label: 'Settings' },
    { src: ProfileIcon, alt: 'Profile', label: 'Profile' },
    { src: HelpIcon, alt: 'Help/About', label: 'Help' },
  ];

  const navigate = useNavigate();

  const handleIconClick = (label) => {
    if (label === 'MentorMind') navigate('/mentormind');
    else if (label === 'CodeExplorer') navigate('/');
    else if (label === 'Settings') navigate('/');
    else if (label === 'Profile') navigate('/');
    else if (label === 'Help') navigate('/');
  };

  return (
    <nav className="navbar">
      {/* Left section */}
      <div className="nav-left">
        {leftIcons.map((icon, idx) => (
          <IconButton 
            key={idx} 
            {...icon} 
            onClick={() => handleIconClick(icon.label)} 
          />
        ))}
      </div>
      {/* Right section */}
      <div className="nav-right">
        {rightIcons.map((icon, idx) => (
          <IconButton 
            key={idx} 
            {...icon} 
            onClick={() => handleIconClick(icon.label)} 
          />
        ))}
      </div>
    </nav>
  );
};

export default Nav;
