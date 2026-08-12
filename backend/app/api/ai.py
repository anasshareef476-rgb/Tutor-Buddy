from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_tutor import generate_roadmap, generate_summary

router = APIRouter()

class RoadmapRequest(BaseModel):
    goal: str
    weeks: int = 4

class SummaryRequest(BaseModel):
    text: str
    style: str = "bullet"  # bullet, short, detailed

@router.post("/roadmap")
def create_roadmap(request: RoadmapRequest):
    result = generate_roadmap(request.goal, request.weeks)
    return result

@router.post("/summary")
def create_summary(request: SummaryRequest):
    result = generate_summary(request.text, request.style)
    return {"summary": result}
