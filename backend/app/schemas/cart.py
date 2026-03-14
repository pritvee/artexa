from pydantic import BaseModel
from typing import List, Optional, Any
from app.schemas.product import ProductOut

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1
    customization_details: Optional[Any] = None
    preview_image_url: Optional[str] = None
    uploaded_photo_id: Optional[int] = None

class CartItemCreate(CartItemBase):
    pass

class CartItemOut(CartItemBase):
    id: int
    product: ProductOut
    class Config:
        from_attributes = True

class CartOut(BaseModel):
    id: int
    user_id: int
    items: List[CartItemOut]
    class Config:
        from_attributes = True
