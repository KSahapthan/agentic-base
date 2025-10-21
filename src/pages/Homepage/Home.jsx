// src/pages/Home/Home.jsx
import React from 'react';
import './Home.css';
import ProductCard from './ProductCard';

const products = [
  {
    title: 'NihonAgent',
    description: 'An agentic Japanese tutor that adapts to your pace, helping you learn Japanese interactively with AI-powered exercises and instant feedback'
  },
  {
    title: 'CodeExplorer',
    description: 'A powerful agent designed to navigate and analyze codebases and repositories, making it easy to understand, debug, and manage large projects efficiently'
  }
];

const Home = () => (
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

    <div className="products-section">
      {products.map((product) => (
        <ProductCard 
          key={product.title} 
          title={product.title} 
          description={product.description} 
        />
      ))}
    </div>
  </div>
);

export default Home;
