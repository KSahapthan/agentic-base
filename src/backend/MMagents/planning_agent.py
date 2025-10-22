# src/backend/agents/planning_agent.py
from .base_agent import BaseAgent
from .schemas.PA_schemas import PlanOutput
from google import genai
from google.genai import types
from pathlib import Path

SYSTEM_PROMPT = Path("./system_instructions/PA.md").read_text(encoding="utf-8")

class PlanningAgent(BaseAgent):
    def __init__(self, api_key: str, name: str = "PlanningAgent"):
        super().__init__(name=name, system_prompt=SYSTEM_PROMPT)
        self.api_key = api_key
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = "gemini-2.5-flash-preview-05-20"

    def run(self, skill: str, context: str) -> PlanOutput:
        """
        Run the planning agent for any skill and user context.
        """
        # Short prompt just passing the inputs; main instructions come from system_prompt
        prompt = f"""
            {self.system_prompt}\n
            Skill: {skill}\n
            Context: {context}\n
            """
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=PlanOutput.model_json_schema(),
        )
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[prompt],
            config=config,
        )
        try:
            return PlanOutput.model_validate_json(response.text)
        except Exception as e:
            raise ValueError(f"Failed to parse LLM output into PlanOutput: {e}\nRaw output: {response.text}")
