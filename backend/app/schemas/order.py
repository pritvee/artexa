from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

from app.schemas.product import ProductOut
from app.schemas.user import UserMin

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float
    customization_details: Optional[Any] = None
    preview_image_url: Optional[str] = None
    uploaded_photo_id: Optional[int] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemOut(OrderItemBase):
    id: int
    product: Optional[ProductOut] = None
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    shipping_address: str
    gift_note: Optional[str] = None
    total_price: float
    status: str
    payment_method: str
    payment_status: str
    created_at: datetime
    courier_partner: Optional[str] = None
    tracking_id: Optional[str] = None
    estimated_delivery: Optional[datetime] = None

class OrderCreate(BaseModel):
    shipping_address: str
    payment_method: str = "online"
    gift_note: Optional[str] = None
    item_ids: Optional[List[int]] = None

class OrderOut(OrderBase):
    id: int
    items: List[OrderItemOut]
    user: Optional[UserMin] = None
    class Config:
        from_attributes = True

class PaymentVerify(BaseModel):
    order_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class DashboardStatsOut(BaseModel):
    total_orders: int
    total_revenue: float
    total_users: int
    total_products: int
    pending_orders: int
    delivered_orders: int
    recent_orders: List[OrderOut]
    class Config:
        from_attributes = True

class OrderListOut(BaseModel):
    items: List[OrderOut]
    total: int
    page: int
    limit: int
    class Config:
        from_attributes = True
