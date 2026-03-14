from pydantic import BaseModel

from typing import Dict, Any

class Token(BaseModel):
    access_token: str
    token_type: str
    user_data: Dict[str, Any]


class TokenPayload(BaseModel):
    sub: str = None
    exp: int = None
