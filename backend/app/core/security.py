from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jose import jwt
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(subject: Union[str, Any], expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    try:
        # Standardize hash format: handle string representation of bytes and extra whitespace
        cleaned_hash = hashed_password.strip()
        
        # Strip b'' or b"" prefixes if the hash was stored as a string representation of bytes
        if cleaned_hash.startswith("b'") and cleaned_hash.endswith("'"):
            cleaned_hash = cleaned_hash[2:-1]
        elif cleaned_hash.startswith('b"') and cleaned_hash.endswith('"'):
            cleaned_hash = cleaned_hash[2:-1]
            
        return pwd_context.verify(plain_password, cleaned_hash)
    except Exception:
        # Fallback to direct verification if standardization fails
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            # Avoid potential indexing errors in logging
            if isinstance(hashed_password, str):
                preview = hashed_password[:10]
            else:
                preview = "INVALID"
            print(f"DEBUG: Password verification failed for hash starting with {preview}...")
            return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
