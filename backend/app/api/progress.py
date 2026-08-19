from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.progress import Progress
from pydantic import BaseModel

router = APIRouter()

class QuizResult(BaseModel):
    score: int
    questions: int

@router.get("")
def get_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    progress = db.query(Progress).filter(Progress.user_id == current_user.id).first()
    if not progress:
        progress = Progress(user_id=current_user.id)
        db.add(progress)
        db.commit()
        db.refresh(progress)
    return {
        "quizzes_taken": progress.quizzes_taken,
        "questions_answered": progress.questions_answered,
        "total_score": progress.total_score,
        "time_studied": progress.time_studied
    }

@router.post("/quiz")
def update_quiz_progress(result: QuizResult, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    progress = db.query(Progress).filter(Progress.user_id == current_user.id).first()
    if not progress:
        progress = Progress(user_id=current_user.id)
        db.add(progress)
        
    progress.quizzes_taken += 1
    progress.questions_answered += result.questions
    progress.total_score += result.score
    
    db.commit()
    db.refresh(progress)
    return {"message": "Progress updated"}
