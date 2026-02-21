import json
import httpx
from typing import Dict, Any, List
from app.config import settings

class AIPlanGenerator:
    """Service to interact with Gemini API to general plans and daily content"""
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={self.api_key}"

    async def _call_gemini_api(self, prompt: str) -> str:
        """Call the Gemini API with a text prompt"""
        if not self.api_key:
            return "AI service not configured: GEMINI_API_KEY is missing."
            
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(self.api_url, json=payload)
                response.raise_for_status()
                data = response.json()
                
                # Extract text response from Gemini's JSON structure
                if "candidates" in data and len(data["candidates"]) > 0:
                    parts = data["candidates"][0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
                
                return ""
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
For example, if the goal is "loose weight", provide progressing daily topics focusing on diet and exercise.

Return EXACTLY a JSON array of strings, where each string is the topic for that day.
The array MUST have exactly {total_days} elements.
Do NOT include any markdown blocks other than the JSON itself.
Example format:
[
  "Day 1: Introduction, assessing current state, light walk",
  "Day 2: ...",
  ...
]
"""
        try:
            content = await self._call_gemini_api(prompt)
            # Find json block
            if "```json" in content:
                content = content.split("```json")[-1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[-1].split("```")[0]
            
            topics = json.loads(content.strip())
            if isinstance(topics, list) and len(topics) > 0:
                # pad or truncate if needed
                if len(topics) > total_days:
                    topics = topics[:total_days]
                while len(topics) < total_days:
                    topics.append(f"Continued progress for {title}")
                return topics
        except Exception as e:
            print(f"Outline generation failed: {e}")
            
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
        content = ""
        try:
            content = await self._call_gemini_api(prompt)
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
                
            data = json.loads(content.strip())
            return {
                "overview": data.get("overview", f"Focus on: {topic}"),
                "tasks": data.get("tasks", []),
                "details": data.get("details", "Follow the plan."),
                "tips": data.get("tips", "")
            }
        except Exception as e:
            print(f"Daily content generation failed: {e}, Content: {content}")
            return {
                "overview": f"Focus on: {topic}",
                "tasks": [f"Work on {topic}"],
                "details": "Content generation failed, displaying default template.",
                "tips": "Stay consistent."
            }
