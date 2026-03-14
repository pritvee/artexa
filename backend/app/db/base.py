# This file is imported by Alembic and main.py startup to ensure
# all models are registered with SQLAlchemy's metadata.
from app.db.base_class import Base  # noqa: F401
from app.models.models import User, Product, Category, Order, OrderItem, Cart, CartItem, UploadedPhoto, DeliveryTracking, Admin  # noqa: F401
