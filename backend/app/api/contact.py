from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from typing import Optional
import smtplib
from email.message import EmailMessage
import os

router = APIRouter()

def send_email_sync(msg: EmailMessage, smtp_server: str, smtp_port: int, smtp_user: str, smtp_password: str):
    try:
        if not smtp_password:
            print("Simulated Email Send: SMTP_PASSWORD not set in .env")
            return
            
        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
    except Exception as e:
        print(f"Failed to send email in background: {e}")

@router.post("")
async def submit_contact_form(
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    try:
        SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        SMTP_PORT = int(os.getenv("SMTP_PORT", 465))
        SMTP_USER = os.getenv("SMTP_USER", "anasshareef476@gmail.com")
        SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
        TARGET_EMAIL = "anasshareef476@gmail.com"

        msg = EmailMessage()
        msg['Subject'] = f"New Contact Request from {name}"
        msg['From'] = SMTP_USER
        msg['To'] = TARGET_EMAIL
        
        body = f"New Contact Request Received!\n\nName: {name}\nEmail: {email}\n\nMessage / Complaint:\n{message}"
        msg.set_content(body)

        if file:
            file_content = await file.read()
            msg.add_attachment(file_content, maintype='application', subtype='octet-stream', filename=file.filename)

        # Dispatch the blocking SMTP call to a background task
        background_tasks.add_task(send_email_sync, msg, SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)

        return {"status": "success", "message": "Your message is being sent successfully!"}
    except Exception as e:
        print(f"Contact form error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process request: {str(e)}")
