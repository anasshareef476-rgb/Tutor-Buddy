from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.document import Document
import os, shutil

router = APIRouter()

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def process_document(doc_id: int, filepath: str, db_url: str):
    """Background task: extract text from document."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.models.document import Document
    import PyPDF2

    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        return

    try:
        doc.status = "processing"
        db.commit()

        text = ""
        if filepath.endswith(".pdf"):
            with open(filepath, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() or ""
        elif filepath.endswith(".txt"):
            with open(filepath, "r", encoding="utf-8") as f:
                text = f.read()
        elif filepath.endswith(".docx"):
            import docx
            doc_obj = docx.Document(filepath)
            text = "\n".join([para.text for para in doc_obj.paragraphs])

        # Store extracted text summary in description (simplified for now)
        doc.content = text
        doc.status = "completed"
        db.commit()
    except Exception as e:
        doc.status = "error"
        db.commit()
    finally:
        db.close()

@router.post("/upload")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user_id = 1
    allowed_types = [".pdf", ".txt", ".docx"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    filepath = os.path.join(UPLOAD_DIR, f"{user_id}_{file.filename}")
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc = Document(user_id=user_id, filename=file.filename, file_type=ext.lstrip("."), status="pending")
    db.add(doc)
    db.commit()
    db.refresh(doc)

    from app.core.config import settings
    background_tasks.add_task(process_document, doc.id, filepath, settings.DATABASE_URL)

    return {"id": doc.id, "filename": file.filename, "status": "pending"}

@router.get("/")
def get_documents(db: Session = Depends(get_db)):
    user_id = 1
    docs = db.query(Document).filter(Document.user_id == user_id).order_by(Document.created_at.desc()).all()
    return [{"id": d.id, "filename": d.filename, "file_type": d.file_type, "status": d.status, "created_at": d.created_at} for d in docs]

@router.get("/{doc_id}")
def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "id": doc.id,
        "filename": doc.filename,
        "file_type": doc.file_type,
        "status": doc.status,
        "created_at": doc.created_at,
        "content": doc.content
    }

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}
