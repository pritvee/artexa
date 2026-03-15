import os
from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Artexa – Custom Photo & Gift Studio"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/artexa_db")

    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-goes-here-make-it-long-and-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 600 # Longer for dev convenience
    UPLOAD_DIR: str = "uploads"

    # Razorpay Settings (Mock keys for setup)
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_5yBThevW2uEub2")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "razorpay_secret_key_here")

    # Email Settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "Artexa Notification")

    class Config:
        case_sensitive = True

settings = Settings()

