// src/pages/Home/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import ProductCard from './ProductCard';
import MentorMindText from '../../assets/display-text/MM.md?raw';
import CodeExplorerText from '../../assets/display-text/CE.md?raw';

const products = [
  {
    title: 'MentorMind',
    description: MentorMindText
  },
  {
    title: 'CodeExplorer',
    description: CodeExplorerText
  }
];

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/mentormind');
  };

  return (
    <div className="home-container">
      {/* the main eye-catchy area */}
      <div className="hero-section">
        <h1 className="hero-title">Welcome to AgenticBase</h1>
        <p className="hero-subtitle">
          Your AI-powered personal agent hub. Explore, automate, and enhance your workflows.
        </p>
        <div className="hero-buttons">
          <button className="cta-btn" onClick={handleGetStarted}>Get Started</button>
          <a 
            href="https://github.com/KSahapthan/agentic-base" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <button className="cta-btn secondary">Source Code</button>
          </a>
        </div>
      </div>
      {/* products available */}
      <div className="products-section">
        {products.map((product) => (
          <ProductCard 
            key={product.title} 
            title={product.title} 
            description={product.description} 
          />
        ))}
      </div>
      {/* Footer */}
      <footer className="home-footer">
        Created by <a href="https://github.com/KSahapthan" target="_blank" rel="noopener noreferrer">KSahapthan</a>
      </footer>
    </div>
  );
};

export default Home;
