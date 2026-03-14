from pydantic import BaseModel, EmailStr
from typing import Optional, List

class AddressBase(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str
    country: str = "India"
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressOut(AddressBase):
    id: int
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: str

class UserCreate(UserBase):
    password: str

class UserMin(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    class Config:
        from_attributes = True

class UserOut(UserMin):
    phone: Optional[str] = None
    is_active: bool
    addresses: List[AddressOut] = []



class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
