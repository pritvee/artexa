from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MessageBase(BaseModel):
    message: Optional[str] = None
    attachment_2d: Optional[str] = None
    attachment_3d: Optional[str] = None
    sender: str # "user" or "admin"

class MessageCreate(MessageBase):
    user_id: Optional[int] = None

class Message(MessageBase):
    id: int
    user_id: int
    timestamp: datetime
    is_read: bool

    class Config:
        orm_mode = True

class ConversationSummary(BaseModel):
    user_id: int
    user_name: str
    last_message: Optional[str]
    timestamp: datetime
    is_read: bool
    unread_count: int
