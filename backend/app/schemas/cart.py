from pydantic import BaseModel, Field, AliasChoices
from typing import List, Optional, Any
from app.schemas.product import ProductOut

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(default=1, gt=0)
    customization_details: Optional[Any] = None
    preview_image_url: Optional[str] = Field(None, validation_alias=AliasChoices('preview_image_url', 'image'))
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
