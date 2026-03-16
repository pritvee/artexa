from pydantic import BaseModel
from typing import Optional, List

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    category_id: int
    customization_type: Optional[str] = None
    has_customization: bool = False
    customization_schema: Optional[dict] = None
    image_url: Optional[str] = None
    secondary_images: Optional[List[str]] = []
    is_on_home: bool = False
    is_on_shop: bool = True

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    class Config:
        from_attributes = True

class ProductListOut(BaseModel):
    items: List[ProductOut]
    total: int
    page: int
    limit: int
    class Config:
        from_attributes = True
