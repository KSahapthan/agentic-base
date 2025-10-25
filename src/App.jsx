// src/App.jsx
import Nav from './components/Nav/Nav';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';

function App() {
  return (
    <Router>
      <Nav />
      <AppRoutes />
    </Router>
  );
}

export default App;
