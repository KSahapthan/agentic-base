# src/backend/mentormind_main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

# Import routers (3 main agents + planning + database)
from .api_routes.chat_routes import router as chat_router
from .api_routes.quiz_routes import router as quiz_router
from .api_routes.evaluator_routes import router as evaluator_router
from .api_routes.planning_routes import router as planning_router
from .api_routes.database_routes import router as database_router

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

# Define lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("FastAPI backend initialized successfully (STARTUP)")
    yield
    print("FastAPI backend shutting down (SHUTDOWN)")

# Create FastAPI app
app = FastAPI(
    title="MentorMind Backend",
    version="1.0",
    description="Agentic backend with Hint, Quiz, and Evaluator agents.",
    lifespan=lifespan
)

# Allow React frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173", 
        "http://localhost:3000",  # Keep these if needed
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers for each agent
app.include_router(planning_router, prefix="/plan", tags=["Planning Agent"])
app.include_router(chat_router, prefix="/chat", tags=["Chat Agent"])
app.include_router(quiz_router, prefix="/quiz", tags=["Quiz Agent"])
app.include_router(evaluator_router, prefix="/evaluate", tags=["Evaluator Agent"])
app.include_router(database_router, prefix="/db", tags=["Database Operations"])

# Root endpoint
@app.get("/")
def root():
    return {"status": "ok", "message": "MentorMind FastAPI backend running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("mentormind_main:app", host="127.0.0.1", port=8000, reload=True)

