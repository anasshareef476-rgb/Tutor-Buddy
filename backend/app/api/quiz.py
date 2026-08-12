from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.ai_tutor import generate_quiz_questions

router = APIRouter()

class QuizRequest(BaseModel):
    topic: str
    count: int = 5

@router.post("/generate")
def generate_quiz(request: QuizRequest):
    questions = generate_quiz_questions(request.topic, request.count)
    return {"topic": request.topic, "questions": questions}
