// src/components/Nav/Nav.jsx
import React from 'react';
import './Nav.css';
import CodeExplorerIcon from '../../assets/CodeExplorer-button-1.png';
import NihonAgentIcon from '../../assets/NihonAgent-button-1.png';
import SettingsIcon from '../../assets/settings-1.png';
import HelpIcon from '../../assets/help-1.png';

const Nav = () => {
  return (
    <nav className="navbar">
      {/* Left section: icons for agents */}
      <div className="nav-left">
        <div className="icon-wrapper">
          <button className="icon-btn">
            <img 
              src={NihonAgentIcon} 
              alt="NihonAgent" 
              className="nav-icon" />
          </button>
          <span className="icon-label">NihonAgent</span>
        </div>
        <div className="icon-wrapper">
          <button className="icon-btn">
            <img 
              src={CodeExplorerIcon} 
              alt="CodeExplorer" 
              className="nav-icon" />
          </button>
          <span className="icon-label">CodeExplorer</span>
        </div>
      </div>

      {/* Center section: logo + site name */}
      <div className="nav-center">
        <span className="nav-title">AgenticBase</span>
      </div>

      {/* Right section: settings, help, profile*/}
      <div className="nav-right">
        <div className="icon-wrapper">
          <button className="icon-btn">
            <img 
              src={SettingsIcon} 
              alt="Settings" 
              className="nav-icon" />
          </button>
          <span className="icon-label">Settings</span>
        </div>
        <div className="icon-wrapper">
          <button className="icon-btn">
            <img 
              src={HelpIcon} 
              alt="Help/About" 
              className="nav-icon" />
          </button>
          <span className="icon-label">Profile</span>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
