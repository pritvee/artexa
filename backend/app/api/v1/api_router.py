from fastapi import APIRouter
from app.api.v1.endpoints import products, orders, auth, users, admin, cart, delivery, customization, chat

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(delivery.router, prefix="/delivery", tags=["delivery"])
api_router.include_router(customization.router, prefix="/customization", tags=["customization"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
