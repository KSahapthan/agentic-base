// src/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Homepage/Home.jsx';
import MentorMind from './pages/MM/MentorMind.jsx';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/mentormind" element={<MentorMind />} />
  </Routes>
);

export default AppRoutes;
