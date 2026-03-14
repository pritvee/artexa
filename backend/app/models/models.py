from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    role = Column(String(20), default="user") # user, admin
    addresses = relationship("Address", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    orders = relationship("Order", back_populates="user")
    messages = relationship("Message", back_populates="user")

class Address(Base):
    __tablename__ = "addresses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    street = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    zip_code = Column(String(20))
    country = Column(String(100), default="India")
    is_default = Column(Boolean, default=False)
    user = relationship("User", back_populates="addresses")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True)
    description = Column(String(255))
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    description = Column(String(1000))
    price = Column(Float)
    stock = Column(Integer, default=0)
    category_id = Column(Integer, ForeignKey("categories.id"))
    customization_type = Column(String(50)) # Frame, Mug, Hamper, etc.
    has_customization = Column(Boolean, default=False)
    customization_schema = Column(JSON, nullable=True)
    image_url = Column(String(255), nullable=True)
    secondary_images = Column(JSON, nullable=True, default=[])
    is_on_home = Column(Boolean, default=False)
    is_on_shop = Column(Boolean, default=True)
    category = relationship("Category", back_populates="products")
    reviews = relationship("Review", back_populates="product")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)
    comment = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")

class Cart(Base):
    __tablename__ = "carts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    items = relationship("CartItem", back_populates="cart")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    customization_details = Column(JSON, nullable=True)
    preview_image_url = Column(String(255), nullable=True)
    uploaded_photo_id = Column(Integer, ForeignKey("uploaded_photos.id"), nullable=True)
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")

class UploadedPhoto(Base):
    __tablename__ = "uploaded_photos"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_path = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_price = Column(Float)
    status = Column(String(50), default="placed") # placed, processing, printed, shipped, out_for_delivery, delivered
    shipping_address = Column(String(1000))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Tracking fields (moved directly into order for simplicity)
    courier_partner = Column(String(100), nullable=True)
    tracking_id = Column(String(100), nullable=True)
    estimated_delivery = Column(DateTime, nullable=True)

    # Payment fields
    payment_method = Column(String(50), default="online") # online, COD
    payment_status = Column(String(50), default="pending") # pending, paid, failed
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    
    # Soft delete fields
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    tracking = relationship("DeliveryTracking", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price = Column(Float)
    customization_details = Column(JSON, nullable=True)
    preview_image_url = Column(String(255), nullable=True)
    uploaded_photo_id = Column(Integer, ForeignKey("uploaded_photos.id"), nullable=True)
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class DeliveryTracking(Base):
    __tablename__ = "delivery_tracking"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    courier_partner = Column(String(100), nullable=True)
    tracking_id = Column(String(100), nullable=True)
    status = Column(String(100))
    estimated_delivery = Column(DateTime, nullable=True)
    order = relationship("Order", back_populates="tracking")

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String(1000), nullable=True)
    attachment_2d = Column(String(255), nullable=True)
    attachment_3d = Column(String(255), nullable=True)
    sender = Column(String(20)) # "user" or "admin"
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
    user = relationship("User", back_populates="messages")

