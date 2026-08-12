from fastapi import APIRouter, Depends, HTTPException, File, Form, UploadFile
from sqlalchemy.orm import Session
from typing import Optional, List
import tempfile
import shutil
import os
from app.core.database import get_db
from app.services.ai_tutor import generate_chat_response
from app.models.chat import Chat, ChatMessage

router = APIRouter()

@router.post("/")
def send_message(
    message: str = Form(...),
    chat_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    user_id = 1  # Mocked user for now

    # Get or create chat
    if chat_id:
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
    else:
        chat = Chat(user_id=user_id, title=message[:50])
        db.add(chat)
        db.commit()
        db.refresh(chat)

    # Retrieve history
    history = db.query(ChatMessage).filter(ChatMessage.chat_id == chat.id).order_by(ChatMessage.created_at.asc()).all()
    history_dicts = [{"role": m.role, "content": m.content} for m in history]

    # Save user message
    db.add(ChatMessage(chat_id=chat.id, role="user", content=message))
    db.commit()

    # Fetch documents for context
    from app.models.document import Document
    docs = db.query(Document).filter(Document.user_id == user_id, Document.status == "completed").all()
    context_text = ""
    valid_docs = [d for d in docs if d.content and len(d.content.strip()) > 0]
    
    if valid_docs:
        context_text = "--- USER UPLOADED DOCUMENTS ---\nThe user has uploaded the following documents. Use this knowledge to answer their questions if relevant.\n\n"
        for d in valid_docs:
            context_text += f"Document: {d.filename}\n{d.content[:8000]}\n\n"
        context_text += "-------------------------------\n"

    # Generate AI response
    ai_text = generate_chat_response(prompt=message, history=history_dicts, context=context_text)

    # Save AI message
    db.add(ChatMessage(chat_id=chat.id, role="ai", content=ai_text))
    db.commit()

    return {"chat_id": chat.id, "user_message": message, "ai_response": ai_text}

@router.get("/")
def get_chats(db: Session = Depends(get_db)):
    user_id = 1
    chats = db.query(Chat).filter(Chat.user_id == user_id).order_by(Chat.updated_at.desc()).all()
    return [{"id": c.id, "title": c.title, "created_at": c.created_at} for c in chats]

@router.get("/{chat_id}/messages")
def get_messages(chat_id: int, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).order_by(ChatMessage.created_at.asc()).all()
    return [{"id": m.id, "role": m.role, "content": m.content, "created_at": m.created_at} for m in messages]

@router.delete("/{chat_id}")
def delete_chat(chat_id: int, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()
    return {"message": "Chat deleted"}
