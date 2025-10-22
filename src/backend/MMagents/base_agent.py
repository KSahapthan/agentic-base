# src/backend/MMagents/base_agent.py
from typing import Any, Dict

class BaseAgent:
    """
    Base class for all agents
    Each agent has:
    - name: identifier for the agent
    - system_prompt: guiding prompt for the agent
    - memory: optional memory to store context or past interactions
    """

    def __init__(self, name: str, system_prompt: str = "", memory: Any = None):
        self.name = name
        self.system_prompt = system_prompt
        self.memory = memory

    def run(self, input: str, context: Dict = {}) -> str:
        """
        - Main method for agents to process input and return output
        - Must be implemented by subclasses
        """
        raise NotImplementedError("Subclasses must implement the `run` method")
