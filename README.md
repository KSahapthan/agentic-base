<h1 align="center">🚀 AgenticBase</h1>

<p align="center">
  <em>Your AI-Powered Personal Agent Hub for Learning, Code Exploration, and Intelligent Automation</em>
</p>

<p align="center">
  <img src="public/ab-raw-3.png" alt="AgenticBase Banner" width="300"/>
</p>

---

AgenticBase is a full-stack application that combines the power of multiple AI agents to create an intelligent learning and development environment. Built with modern web technologies and powered by **Google's Gemini AI**, it provides personalized learning experiences, code analysis, and intelligent tutoring.

## Key Features
### MentorMind — AI-Powered Adaptive Tutor
- **Personalized Learning Paths (Planning Agent):** Automatically generates structured learning plans for any skill or domain  
- **Interactive Quizzing (Quiz Agent):** Adaptive 5-question quizzes with real-time evaluation
- **AI Chat Support (Chat Agent):** Integrated tutor for on-demand explanations and guidance  
- **Progress Tracking (Evaluator Agent):** Persistent JSON-based progress storage.  
- **Multi-Skill Learning:** Seamlessly manage and switch between multiple learning tracks

### CodeExplorer — Intelligent Repo Analysis *(Coming Soon)*
- **Code Navigation**: AI-assisted exploration of codebases for better context and understanding.   
- **AI Debugging**: Identifies potential issues and suggests solutions intelligently

## Tech Stack
### Frontend
<p>
  <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Router_DOM-CA4245?logo=reactrouter&logoColor=white" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" />
</p>


### Backend
<p>
  <img src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Uvicorn-6D6D6D?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Pydantic-2C5F96?logo=pydantic&logoColor=white" />
  <img src="https://img.shields.io/badge/Google-4285F4?logo=google&logoColor=white" />
</p>
 
## Installation

**Clone the repository**
   ```bash
   git clone https://github.com/KSahapthan/agentic-base.git
   cd agentic-base
   ```
**Install dependencies**
   ```bash
   npm install
   pip install fastapi uvicorn python-dotenv google-genai pydantic
   ```
**Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_PRIMARY_KEY=your_gemini_api_key_here
   ```
**Start the application**
   ```bash
   npm run dev
   ```
This will start both the React frontend (http://localhost:5173) and FastAPI backend (http://localhost:8000)



## Architecture
<p align="center">
  <img src="public/architecture.png" alt="MentorMind Architecture" width="300"/>
</p>

## 📁 Repository Structure

```
agentic-base/
└── .env                        
└── .gitignore
└── index.html
└── public 
├── src/
│   └── main.jsx
│   └── App.jsx
│   └── AppRoutes.jsx
│   ├── assets/                 # Static assets
│   ├── index.css
│   ├── components/             # React components
│   ├── pages/                  # Page components
│   ├── backend/
│   │   ├── api_routes/         # FastAPI route handlers
│   │   │   └── chat_routes.py
│   │   │   └── quiz_routes.py
│   │   │   └── evaluator_routes.py
│   │   │   └── planning_routes.py
│   │   │   └── database_routes.py
│   │   │   └── utils.py
│   │   ├── MMagents/           # MentorMind AI agents
│   │   │   ├── schemas         # Pydantic Schemas for AI output extraction
│   │   │   └── base_agent.py
│   │   │   └── planning_agent.py
│   │   │   └── quiz_agent.py
│   │   │   └── evaluator_agent.py
│   │   │   └── chat_agent.py
│   │   └── mentormind_main.py  # FastAPI backend entry point
```

## Ready to get started with AgenticBase?**

Explore the project and see how it can help you streamline learning and code exploration

[![GitHub stars](https://img.shields.io/github/stars/KSahapthan/agentic-base?style=social)](https://github.com/KSahapthan/agentic-base)
[![GitHub forks](https://img.shields.io/github/forks/KSahapthan/agentic-base?style=social)](https://github.com/KSahapthan/agentic-base)
