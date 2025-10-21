// src/components/Nav/Nav.jsx
import React from 'react';
import './Nav.css';
import CodeExplorerIcon from '../../assets/CodeExplorer-button-1.png';
import NihonAgentIcon from '../../assets/NihonAgent-button-1.png';
import SettingsIcon from '../../assets/settings-1.png';
import HelpIcon from '../../assets/help-1.png';
import ProfileIcon from '../../assets/profile-1.png';

// Small reusable component for icon + label
const IconButton = ({ src, alt, label }) => (
  <div className="icon-wrapper">
    <button className="icon-btn">
      <img src={src} alt={alt} className="nav-icon" />
    </button>
    <span className="icon-label">{label}</span>
  </div>
);

const Nav = () => {
  // Left section icons
  const leftIcons = [
    { src: NihonAgentIcon, alt: 'NihonAgent', label: 'NihonAgent' },
    { src: CodeExplorerIcon, alt: 'CodeExplorer', label: 'CodeExplorer' },
  ];

  // Right section icons
  const rightIcons = [
    { src: SettingsIcon, alt: 'Settings', label: 'Settings' },
    { src: ProfileIcon, alt: 'Profile', label: 'Profile' },
    { src: HelpIcon, alt: 'Help/About', label: 'Help' },
  ];

  return (
    <nav className="navbar">
      {/* Left section */}
      <div className="nav-left">
        {leftIcons.map((icon, idx) => (
          <IconButton key={idx} {...icon} />
        ))}
      </div>

      {/* Center section */}
      <div className="nav-center">
        <span className="nav-title">AgenticBase</span>
      </div>

      {/* Right section */}
      <div className="nav-right">
        {rightIcons.map((icon, idx) => (
          <IconButton key={idx} {...icon} />
        ))}
      </div>
    </nav>
  );
};

export default Nav;
