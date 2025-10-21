// src/pages/Home/ProductCard.jsx
import React from 'react';

const ProductCard = ({ title, description }) => (
  <div className="product-card">
    <h2>{title}</h2>
    <p>{description}</p>
  </div>
);

export default ProductCard;
