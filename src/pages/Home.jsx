// src/pages/Home.jsx
import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">Welcome to AgenticBase</h1>
        <p className="hero-subtitle">
          Your AI-powered personal agent hub. Explore, automate, and enhance your workflows.
        </p>
        <div className="hero-buttons">
          <button className="cta-btn">Get Started</button>
          <button className="cta-btn secondary">Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
