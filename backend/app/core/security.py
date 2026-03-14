from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    try:
        # Strip trailing whitespace and handle b'' prefix if stored as string representation of bytes
        cleaned_hash = hashed_password.strip()
        if cleaned_hash.startswith("b'") and cleaned_hash.endswith("'"):
            cleaned_hash = cleaned_hash[2:-1]
        elif cleaned_hash.startswith('b"') and cleaned_hash.endswith('"'):
            cleaned_hash = cleaned_hash[2:-1]
            
        return pwd_context.verify(plain_password, cleaned_hash)
    except Exception:
        # Fallback for plain text or malformed hashes
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
