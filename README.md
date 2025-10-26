<h1 align="center">🚀 AgenticBase</h1>

<p align="center">
  <em>Your AI-Powered Personal Agent Hub for Learning, Code Exploration, and Intelligent Automation</em>
</p>

<p align="center">
  <img src="public/ab-raw-3.png" alt="AgenticBase Banner" width="400"/>
</p>

---

AgenticBase is a cutting-edge full-stack application that combines the power of multiple AI agents to create an intelligent learning and development environment.  
Built with modern web technologies and powered by **Google's Gemini AI**, it provides personalized learning experiences, code analysis, and intelligent tutoring.

---

## Key Features

### MentorMind — AI-Powered Adaptive Tutor
- **Personalized Learning Paths**: Automatically generates structured learning plans for any skill or domain.  
- **Interactive Quizzing**:  
  - Adaptive 5-question quizzes with real-time evaluation.  
  - Supports rich markdown for code, equations, and diagrams.  
  - Controlled quiz flow for consistent assessment.  
- **AI Chat Support**: Integrated tutor for on-demand explanations and guidance.  
- **Progress Tracking**:  
  - Detailed learning analytics and topic mastery insights.  
  - Persistent JSON-based progress storage.  
- **Multi-Skill Learning**: Seamlessly manage and switch between multiple learning tracks.  

### CodeExplorer — Intelligent Code Analysis *(Coming Soon)*
- **Code Navigation**: AI-assisted exploration of codebases for better context and understanding.  
- **Automated Insights**: Deep analysis of structure, patterns, and dependencies.  
- **AI Debugging**: Identifies potential issues and suggests solutions intelligently.  


## Tech Stack

### Frontend
<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-4B32C3?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Router_DOM-CA4245?logo=reactrouter&logoColor=white" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" />
</p>

### Backend
<p>
  <img src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Uvicorn-121212?logo=uvicorn&logoColor=white" />
  <img src="https://img.shields.io/badge/Pydantic-E92063?logo=pydantic&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini_AI-4285F4?logo=google&logoColor=white" />
</p>

### AI Agent Modules
- **Planning Agent** – Generates structured learning paths  
- **Quiz Agent** – Creates adaptive quizzes  
- **Evaluator Agent** – Provides intelligent feedback  
- **Chat Agent** – Delivers contextual tutoring support  

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KSahapthan/agentic-base.git
   cd agentic-base
   ```

2. **Install dependencies**
   ```bash
   npm install
   pip install fastapi uvicorn python-dotenv google-genai pydantic
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_PRIMARY_KEY=your_gemini_api_key_here
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```
   This will start both the React frontend (http://localhost:5173) and FastAPI backend (http://localhost:8000)

## Usage

### **Getting Started with MentorMind**

1. **Create Your First Skill**
   - Click "New Skill" button
   - Enter the skill you want to learn (e.g., "Python Programming", "Machine Learning")
   - Provide context about your learning goals and current level
   - AI generates a personalized 10-topic starter learning plan

2. **Start Learning**
   - Select "Continue Skill" to resume existing learning
   - Answer 5 adaptive questions per subtopic
   - Get instant feedback and explanations

3. **Chat with AI Tutor**
   - Use the left panel to ask questions anytime
   - Get personalized explanations and learning tips
   - AI adapts responses based on your current topic

### **Learning Flow**
```
Select Skill → Generate Plan → Start Learning → Interactive Quiz → 
Get Feedback → Next Question → Complete Subtopic → Next Topic
```

## Architecture

### **Agent-Based Design**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Planning      │    │     Quiz        │    │   Evaluator     │
│    Agent        │    │    Agent        │    │    Agent        │
│                 │    │                 │    │                 │
│ • Creates       │    │ • Generates     │    │ • Evaluates     │
│   curricula     │    │   questions     │    │   answers       │
│ • Structures    │    │ • Adapts        │    │ • Provides      │
│   learning      │    │   difficulty    │    │   feedback      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    Chat Agent    │
                    │                 │
                    │ • Real-time     │
                    │   support       │
                    │ • Explanations  │
                    │ • Learning tips │
                    └─────────────────┘
```

## 📁 Repository Structure

```
agentic-base/
└── .env                        # API keys
└── .gitignore
└── index.html
└── public # has favicon
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
│   │   ├── MMagents/            # MentorMind AI agents
│   │   │   ├── schemas          # Pydantic Schemas for AI output extraction
│   │   │   └── base_agent.py
│   │   │   └── planning_agent.py
│   │   │   └── quiz_agent.py
│   │   │   └── evaluator_agent.py
│   │   │   └── chat_agent.py
│   │   └── mentormind_main.py   # FastAPI backend entry point
```

---

**Ready to get started with AgenticBase?**

Explore the project and see how it can help you streamline learning and code exploration.

[![GitHub stars](https://img.shields.io/github/stars/KSahapthan/agentic-base?style=social)](https://github.com/KSahapthan/agentic-base)
[![GitHub forks](https://img.shields.io/github/forks/KSahapthan/agentic-base?style=social)](https://github.com/KSahapthan/agentic-base)
