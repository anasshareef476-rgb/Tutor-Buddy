from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import get_db
from app.models.user import User
from app.models.progress import Progress
from app.core.security import verify_password, get_password_hash, create_access_token, create_reset_token, verify_reset_token
from pydantic import BaseModel

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize progress
    progress = Progress(user_id=new_user.id)
    db.add(progress)
    db.commit()
    
    return {"message": "User registered successfully"}

@router.post("/login")
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # To prevent email enumeration, we return a success message even if the email is not found
        return {"message": "If that email exists, a reset link has been generated."}
    
    token = create_reset_token(user.email)
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    
    # In a real application, you would use SendGrid/Mailgun/SMTP to email this link.
    # For now, we will print it to the server console so it can be tested locally.
    print(f"\n{'='*50}\nPASSWORD RESET LINK FOR {user.email}:\n{reset_link}\n{'='*50}\n")
    
    return {"message": "If that email exists, a reset link has been generated (check terminal)."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = verify_reset_token(req.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    
    return {"message": "Password has been successfully reset"}
