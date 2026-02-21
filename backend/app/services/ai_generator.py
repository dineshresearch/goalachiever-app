import json
from typing import Dict, Any, List
from google import genai
from app.config import settings

class AIPlanGenerator:
    """Service to interact with Gemini API to general plans and daily content"""
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    async def _call_gemini_api(self, prompt: str) -> str:
        """Call the Gemini API with a text prompt"""
        if not self.client:
            return "AI service not configured: GEMINI_API_KEY is missing."
            
        try:
            response = await self.client.aio.models.generate_content(
                model='gemini-3-flash-preview',
                contents=prompt
            )
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {str(e)}")
            raise

    async def generate_goal_outline(self, title: str, description: str, total_days: int) -> List[str]:
        """Generate an outline of daily topics for the entire goal duration."""
        desc_text = f" Description: {description}" if description else ""
        prompt = f"""You are an expert planner and coach.
The user has set a goal: '{title}'.{desc_text}
Duration: {total_days} days.

Create a HIGH-LEVEL daily progression for this goal.
Return EXACTLY a JSON array of strings, where each string is the topic for that day.
The array MUST have exactly {total_days} elements.
Do NOT include any markdown blocks other than the JSON itself.
"""
        full_prompt = "You are an expert planner and coach.\n\nUser request: " + prompt
        try:
            content = await self._call_gemini_api(full_prompt)
            # Clean up potential markdown formatting natively
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            topics = json.loads(content)
            if isinstance(topics, list) and len(topics) > 0:
                # pad or truncate if needed
                if len(topics) > total_days:
                    topics = topics[:total_days]
                while len(topics) < total_days:
                    topics.append(f"Continued progress for {title}")
                return topics
        except Exception as e:
            print(f"Outline generation JSON parsing failed: {e}")
            print(f"FAILED RAW CONTENT:\n{content}")
            
        # Fallback deterministic topics
        return [f"Day {i+1}: Work on {title}" for i in range(total_days)]

    async def generate_daily_content(self, title: str, description: str, day_number: int, topic: str) -> Dict[str, Any]:
        """Generate detailed content (e.g. diet and exercise) for a specific day."""
        desc_text = f" Description: {description}" if description else ""
        prompt = f"""You are an expert coach and planner.
The user's overall goal is: '{title}'.{desc_text}
Today is Day {day_number}.
Today's focus topic: '{topic}'

Provide a detailed action plan for today, including:
1. Motivational Overview
2. Specific Tasks or Exercises
3. Diet & Nutrition (if applicable)
4. Key Tips for the day

Format as a detailed, well-structured JSON object like this:
{{
    "overview": "A brief overview of today's focus...",
    "tasks": ["Task 1", "Task 2"],
    "details": "Detailed instructions on how to accomplish the tasks. Use markdown for formatting.",
    "tips": "Important things to keep in mind"
}}

Return ONLY the JSON object. No other text.
"""
        full_prompt = "You are an expert coach and planner.\n\nUser request: " + prompt
        content = ""
        try:
            content = await self._call_gemini_api(full_prompt)
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
                
            data = json.loads(content)
            return {
                "overview": data.get("overview", f"Focus on: {topic}"),
                "tasks": data.get("tasks", []),
                "details": data.get("details", "Follow the plan."),
                "tips": data.get("tips", "")
            }
        except Exception as e:
            print(f"Daily content JSON parsing failed: {e}")
            print(f"FAILED RAW CONTENT:\n{content}")
            return {
                "overview": f"Focus on: {topic}",
                "tasks": [f"Work on {topic}"],
                "details": "Content generation failed, displaying default template.",
                "tips": "Stay consistent."
            }
