# src/backend/MMagents/planning_agent.py
from .base_agent import BaseAgent
from .schemas.EA_schemas import EvaluationInput, EvaluationOutput
from google import genai
from google.genai import types
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
SYSTEM_PROMPT = (CURRENT_DIR / "system_instructions" / "EA.md").read_text(encoding="utf-8")

class EvaluatorAgent(BaseAgent):
    def __init__(self, api_key: str, name: str = "EvaluatorAgent"):
        super().__init__(name=name, system_prompt=SYSTEM_PROMPT)
        self.api_key = api_key
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = "gemini-2.5-flash-preview-05-20"

    def run(self, eval_input: EvaluationInput) -> EvaluationOutput:
        """
        Evaluate user’s answer and optionally generate feedback for the Quiz Agent.
        Args:
            eval_input: EvaluationInput object containing question, true answer, and user answer
        Returns:
            EvaluationOutput: Object containing evaluation, feedback, and quiz_agent_feedback
        """
        prompt = f"""
        {self.system_prompt}
        True Answer: {eval_input.true_answer}
        User Answer: {eval_input.user_answer}
        Give Feedback: {eval_input.give_feedback}
        """
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=EvaluationOutput.model_json_schema(),
        )
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[prompt],
            config=config,
        )
        try:
            eval_output = EvaluationOutput.model_validate_json(response.text)
            return eval_output
        except Exception as e:
            raise ValueError(f"Failed to generate valid evaluation: {e}\nRaw output: {response.text}")
