from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    file_type = Column(String) # pdf, docx, txt
    status = Column(String, default="pending") # pending, processing, completed, error
    content = Column(Text, nullable=True) # AI extracted context
    created_at = Column(DateTime(timezone=True), server_default=func.now())
