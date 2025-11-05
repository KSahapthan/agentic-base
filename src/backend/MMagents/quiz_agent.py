# src/backend/MMagents/quiz_agent.py
from .base_agent import BaseAgent
from .schemas.QA_schemas import QuizInput, QuizOutput
from google import genai
from google.genai import types
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
SYSTEM_PROMPT = (CURRENT_DIR / "system_instructions" / "QA.md").read_text(encoding="utf-8")

class QuizAgent(BaseAgent):
    def __init__(self, api_key: str, name: str = "QuizAgent"):
        super().__init__(name=name, system_prompt=SYSTEM_PROMPT)
        self.api_key = api_key
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = "gemini-2.5-flash-preview-09-2025"

    def run(self, quiz_input: QuizInput) -> QuizOutput:
        """
        Generate quiz questions based on the provided context.
        Args:
            quiz_input: QuizInput object containing topic details and context
        Returns:
            QuizOutput: Object containing 5 questions with answers and explanations
        """
        prompt = f"""
            {self.system_prompt}
            Topic: {quiz_input.topic_name}
            Subtopic: {quiz_input.subtopic_name}
            Description: {quiz_input.subtopic_description}
            Focus Areas: {', '.join(quiz_input.focus_areas)}
            User Context: {quiz_input.user_context}
            Current Mastery: {quiz_input.current_mastery}
            Evaluator Feedback: {quiz_input.evaluator_feedback or 'None provided'}
            \nIf MCQ questions are being generated : embed MCQ options directly inside the Q string.
            Format options on new lines prefixed with A), B), C), etc.
            """  
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=QuizOutput.model_json_schema(),
        )
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[prompt],
            config=config,
        )
        try:
            quiz_output = QuizOutput.model_validate_json(response.text)
            return quiz_output
        except Exception as e:
            raise ValueError(f"Failed to generate valid quiz: {e}\nRaw output: {response.text}")