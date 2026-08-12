from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
import app.models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url="/api/v1/openapi.json"
)

# CORS — allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.api import auth, chat, flashcards, documents, quiz, ai, progress
app.include_router(auth.router,       prefix="/api/v1/auth",       tags=["Auth"])
app.include_router(chat.router,       prefix="/api/v1/chats",      tags=["Chat"])
app.include_router(flashcards.router, prefix="/api/v1/flashcards", tags=["Flashcards"])
app.include_router(documents.router,  prefix="/api/v1/documents",  tags=["Documents"])
app.include_router(quiz.router,       prefix="/api/v1/quiz",       tags=["Quiz"])
app.include_router(ai.router,         prefix="/api/v1/ai",         tags=["AI Utilities"])
app.include_router(progress.router,   prefix="/api/v1/progress",   tags=["Progress"])

@app.get("/")
def read_root():
    return {"message": "AI Tutor Platform API is running ✅", "docs": "/docs"}
