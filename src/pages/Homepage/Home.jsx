// src/pages/Home/Home.jsx
import React from 'react';
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

const Home = () => (
  <div className="home-container">
    {/* the main eye-catchy area */}
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

export default Home;
