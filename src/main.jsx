// wrapper for highlighting potential problems in dev
import { StrictMode } from 'react'
// create root for rendering React components
import { createRoot } from 'react-dom/client'
// global CSS 
import './index.css'
// main App component
import App from './App.jsx'

// mounts React app into the <div id="root"> in HTML
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
