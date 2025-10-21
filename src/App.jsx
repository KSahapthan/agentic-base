// src/App.jsx
import './App.css';
import Nav from './components/Nav/Nav';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      {/* Persistent NavBar */}
      <Nav />
      {/* Page Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
