from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.models.flashcard import FlashcardDeck, Flashcard
from app.services.ai_tutor import extract_flashcards_from_text
from app.services.spaced_repetition import sm2, RATING_MAP

router = APIRouter()

# --- Decks ---
class DeckCreate(BaseModel):
    name: str
    description: Optional[str] = None

@router.post("/decks")
def create_deck(deck: DeckCreate, db: Session = Depends(get_db)):
    user_id = 1
    new_deck = FlashcardDeck(user_id=user_id, name=deck.name, description=deck.description)
    db.add(new_deck)
    db.commit()
    db.refresh(new_deck)
    return {"id": new_deck.id, "name": new_deck.name, "description": new_deck.description}

@router.get("/decks")
def get_decks(db: Session = Depends(get_db)):
    user_id = 1
    decks = db.query(FlashcardDeck).filter(FlashcardDeck.user_id == user_id).all()
    result = []
    for d in decks:
        total = len(d.flashcards)
        due = sum(1 for f in d.flashcards if f.next_review_date is None or f.next_review_date <= __import__('datetime').datetime.utcnow())
        result.append({"id": d.id, "name": d.name, "description": d.description, "total_cards": total, "due_cards": due})
    return result

@router.delete("/decks/{deck_id}")
def delete_deck(deck_id: int, db: Session = Depends(get_db)):
    deck = db.query(FlashcardDeck).filter(FlashcardDeck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    db.delete(deck)
    db.commit()
    return {"message": "Deck deleted"}

# --- Flashcards ---
class FlashcardCreate(BaseModel):
    question: str
    answer: str
    type: Optional[str] = "q_and_a"
    difficulty: Optional[str] = "medium"

@router.post("/decks/{deck_id}/cards")
def add_flashcard(deck_id: int, card: FlashcardCreate, db: Session = Depends(get_db)):
    deck = db.query(FlashcardDeck).filter(FlashcardDeck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    new_card = Flashcard(deck_id=deck_id, question=card.question, answer=card.answer, type=card.type, difficulty=card.difficulty)
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    return {"id": new_card.id, "question": new_card.question, "answer": new_card.answer}

@router.get("/decks/{deck_id}/cards")
def get_flashcards(deck_id: int, db: Session = Depends(get_db)):
    cards = db.query(Flashcard).filter(Flashcard.deck_id == deck_id).all()
    return [{"id": c.id, "question": c.question, "answer": c.answer, "difficulty": c.difficulty, "type": c.type, "next_review_date": c.next_review_date, "interval": c.interval, "ease_factor": c.ease_factor} for c in cards]

@router.get("/decks/{deck_id}/due")
def get_due_cards(deck_id: int, db: Session = Depends(get_db)):
    from datetime import datetime
    cards = db.query(Flashcard).filter(
        Flashcard.deck_id == deck_id,
        (Flashcard.next_review_date == None) | (Flashcard.next_review_date <= datetime.utcnow())
    ).all()
    return [{"id": c.id, "question": c.question, "answer": c.answer, "difficulty": c.difficulty, "type": c.type} for c in cards]

class ReviewRequest(BaseModel):
    rating: str  # "again", "hard", "good", "easy"

@router.post("/cards/{card_id}/review")
def review_flashcard(card_id: int, review: ReviewRequest, db: Session = Depends(get_db)):
    card = db.query(Flashcard).filter(Flashcard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    quality = RATING_MAP.get(review.rating.lower(), 4)
    new_interval, new_ef, new_reps, next_review = sm2(
        quality=quality,
        repetitions=card.repetitions,
        ease_factor=card.ease_factor,
        interval=card.interval
    )
    card.interval = new_interval
    card.ease_factor = new_ef
    card.repetitions = new_reps
    card.next_review_date = next_review
    db.commit()

    return {"card_id": card_id, "next_review_date": next_review, "interval": new_interval, "ease_factor": round(new_ef, 2)}

# --- AI Generate from text ---
class GenerateRequest(BaseModel):
    text: str
    deck_id: int

@router.post("/generate")
def generate_flashcards(request: GenerateRequest, db: Session = Depends(get_db)):
    deck = db.query(FlashcardDeck).filter(FlashcardDeck.id == request.deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    cards = extract_flashcards_from_text(request.text)
    created = []
    for c in cards:
        if "question" in c and "answer" in c:
            new_card = Flashcard(deck_id=request.deck_id, question=c["question"], answer=c["answer"])
            db.add(new_card)
            created.append(c)
    db.commit()
    return {"generated": len(created), "cards": created}
