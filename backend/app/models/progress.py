from sqlalchemy import Column, Integer, ForeignKey
from app.core.database import Base

class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quizzes_taken = Column(Integer, default=0)
    questions_answered = Column(Integer, default=0)
    total_score = Column(Integer, default=0)
    time_studied = Column(Integer, default=0)
