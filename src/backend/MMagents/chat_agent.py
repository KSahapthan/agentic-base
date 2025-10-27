# src/backend/MMagents/chat_agent.py
from .base_agent import BaseAgent
from google import genai
from google.genai import types
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
SYSTEM_PROMPT = (CURRENT_DIR / "system_instructions" / "CA.md").read_text(encoding="utf-8")

class ChatAgent(BaseAgent):
    def __init__(self, api_key: str, name: str = "ChatAgent"):
        super().__init__(name=name, system_prompt=SYSTEM_PROMPT)
        self.api_key = api_key
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = "gemini-2.5-flash-preview-05-20"

    def run(self, user_query: str) -> str:
        """
        Run the chat agent to provide helpful, clear explanations with examples.
        Args:
            user_query: The user's question or request for help
        Returns:
            str: A friendly, clear explanation with examples as needed
        """
        prompt = f"""
            {self.system_prompt}
            User Query: {user_query}
            """
        config = types.GenerateContentConfig(
            # Plain text is fine since we want natural explanations
            response_mime_type="text/plain",
        )
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[prompt],
            config=config,
        )
        try:
            explanation = response.text.strip()
            return explanation
        except Exception as e:
            raise ValueError(f"Failed to generate explanation: {e}\nRaw output: {response.text}")
