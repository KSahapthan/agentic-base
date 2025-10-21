// src/pages/Home/Home.jsx
import React from 'react';
import './Home.css';
import ProductCard from './ProductCard';
import NihonAgentText from '../../assets/display-text/NA.md?raw';
import CodeExplorerText from '../../assets/display-text/CE.md?raw';

const products = [
  {
    title: 'NihonAgent',
    description: NihonAgentText
  },
  {
    title: 'CodeExplorer',
    description: CodeExplorerText
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
