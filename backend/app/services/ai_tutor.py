import json
from google import genai
from google.genai import types
from app.core.config import settings

def get_client():
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set")
    return genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_INSTRUCTION = """You are an expert AI Tutor — friendly, encouraging, and pedagogically excellent. Your role is to:
- Explain concepts step-by-step using simple language first, then build up complexity
- Use real-world analogies and concrete examples
- Never just give answers for assignments — always teach the concept first
- Ask follow-up questions to check understanding
- Encourage critical thinking and curiosity
- Detect when a student is struggling and simplify your explanation
- Format your responses clearly with markdown when helpful (headings, bullet points, code blocks)
- For code questions: explain errors, suggest improvements, and explain the fix
- For math: show the working step by step
- CRITICAL CAPABILITY: You HAVE the ability to generate images! When the user asks for an image or picture, you MUST NOT say you cannot generate images. Instead, you MUST generate the image by responding with a markdown image tag EXACTLY like this: `![<highly detailed description>](https://image.pollinations.ai/prompt/<highly%20detailed%20description>)`. (You must URL-encode spaces in the URL as %20). Provide the image first, then optionally add a small text comment."""

MODEL_NAME = "gemini-3.5-flash"

def generate_chat_response(prompt: str, history: list = None, context: str = "") -> str:
    if not settings.GEMINI_API_KEY:
        return "⚠️ No Gemini API key configured. Please add GEMINI_API_KEY to the backend .env file."
    
    try:
        client = get_client()
        sys_msg = SYSTEM_INSTRUCTION
        if context:
            sys_msg += f"\n\nContext:\n{context}"
        
        contents = []
        if history:
            for msg in history:
                role = "user" if msg["role"] == "user" else "model"
                contents.append(types.Content(role=role, parts=[types.Part.from_text(msg["content"])]))
        
        user_parts = [types.Part.from_text(prompt)]
        contents.append(types.Content(role="user", parts=user_parts))
        
        config = types.GenerateContentConfig(
            system_instruction=sys_msg,
            temperature=0.7,
            max_output_tokens=2048,
        )
        
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
            config=config,
        )
        return response.text or "I couldn't generate a response. Please try again."
    except Exception as e:
        err = str(e)
        print(f"Gemini error: {err}")
        if "429" in err or "RESOURCE_EXHAUSTED" in err:
            return f"*(Rate limit reached! Here is a mock response so you can still test the UI)*\n\nI see you asked about: '{prompt}'. That's an excellent question! In React, `useEffect` allows you to perform side effects in function components."
        return f"❌ AI error: {err[:120]}..."

def extract_flashcards_from_text(text: str) -> list:
    if not settings.GEMINI_API_KEY:
        return []
    try:
        client = get_client()
        prompt = f"""You are creating study flashcards. Based on the text below, generate exactly 5 concise flashcards.
Return ONLY a valid JSON array (no markdown, no code blocks) like:
[{{"question": "...", "answer": "..."}}]

Text:
{text[:4000]}"""
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=8000,
                response_mime_type="application/json"
            )
        )
        raw = response.text.strip()
        if raw.startswith("```"):
            lines = raw.split("\n")
            if lines[0].startswith("```"): lines = lines[1:]
            if lines[-1].startswith("```"): lines = lines[:-1]
            raw = "\n".join(lines).strip()
        return json.loads(raw)
    except Exception as e:
        print(f"Flashcard gen error: {e}")
        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            return [
                {"question": "What is React?", "answer": "A JavaScript library for building user interfaces."},
                {"question": "What is a Hook?", "answer": "A special function that lets you 'hook into' React features."}
            ]
        return []

def generate_quiz_questions(topic: str, count: int = 5) -> list:
    if not settings.GEMINI_API_KEY:
        return []
    try:
        client = get_client()
        prompt = f"""Generate {count} multiple choice quiz questions about: "{topic}"
Return ONLY a valid JSON array (no markdown, no code blocks):
[{{"question":"...", "options":["A","B","C","D"], "correct":0, "explanation":"..."}}]
- correct is the 0-based index of the correct option
- explanations should be educational"""
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.5,
                max_output_tokens=4000,
                response_mime_type="application/json"
            )
        )
        raw = response.text.strip()
        print(f"DEBUG RAW QUIZ: {raw[:200]}...{raw[-200:]}") # Debug print
        
        # Robust parsing in case it STILL wraps in markdown
        if raw.startswith("```"):
            lines = raw.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            raw = "\n".join(lines).strip()
            
        return json.loads(raw)
    except Exception as e:
        print(f"Quiz gen error: {e}")
        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            return [
                {
                    "question": f"(Mock due to rate limit) What does {topic} primarily deal with?",
                    "options": ["Frontend rendering", "Backend databases", "State management", "Network protocols"],
                    "correct": 0,
                    "explanation": f"This is a mock explanation because the Gemini API rate limit (20 requests per day) was reached. In a real scenario, this would explain {topic}."
                },
                {
                    "question": "(Mock) Which of the following is true?",
                    "options": ["A is false", "B is true", "C is true", "D is false"],
                    "correct": 1,
                    "explanation": "Mock explanation 2."
                }
            ]
        return []

def generate_summary(text: str, style: str = "bullet") -> str:
    if not settings.GEMINI_API_KEY:
        return "API key not configured."
    try:
        client = get_client()
        style_prompt = {
            "bullet": "bullet points covering key concepts",
            "short": "a 2-3 sentence summary",
            "detailed": "a comprehensive detailed summary with sections",
        }.get(style, "bullet points")
        prompt = f"Summarize the following text as {style_prompt}:\n\n{text[:5000]}"
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(max_output_tokens=1000)
        )
        return response.text
    except Exception as e:
        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            return "*(Mock summary due to rate limit)*\n- Key concept 1\n- Key concept 2\n- Key concept 3"
        return f"Summary error: {e}"

def generate_roadmap(goal: str, weeks: int) -> dict:
    if not settings.GEMINI_API_KEY:
        return {}
    try:
        client = get_client()
        prompt = f"""Create a {weeks}-week personalized study roadmap for: "{goal}"
Return ONLY a valid JSON object (no markdown):
{{"title":"...", "weeks":[{{"week":1,"topics":["topic1","topic2","topic3"]}}]}}
Each week should have 3-5 specific, actionable topics."""
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.4,
                max_output_tokens=8000,
                response_mime_type="application/json"
            )
        )
        raw = response.text.strip()
        if raw.startswith("```"):
            lines = raw.split("\n")
            if lines[0].startswith("```"): lines = lines[1:]
            if lines[-1].startswith("```"): lines = lines[:-1]
            raw = "\n".join(lines).strip()
        return json.loads(raw)
    except Exception as e:
        print(f"Roadmap gen error: {e}")
        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            return {
                "title": f"(Mock) {weeks}-Week {goal} Roadmap",
                "weeks": [
                    {"week": i, "topics": [f"Introduction to {goal}", "Core Concepts", "Practice Exercises"]} for i in range(1, weeks + 1)
                ]
            }
        return {}
