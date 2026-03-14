from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.models.models import Category, Product, Admin, User
from app.core.security import get_password_hash
from app.db.base import Base

def init_db():
    print("Resetting database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    ADMIN_EMAIL = "admin@example.com"
    
    # Create Admin
    if not db.query(Admin).filter(Admin.email == ADMIN_EMAIL).first():
        admin = Admin(
            name="Admin User",
            email=ADMIN_EMAIL,
            hashed_password=get_password_hash("admin123")
        )
        db.add(admin)
        # Also create a user with admin role in users table for consistency
        user_admin = User(
            name="Admin User",
            email=ADMIN_EMAIL,
            hashed_password=get_password_hash("admin123"),
            role="admin",
            phone="1234567890"
        )
        db.add(user_admin)

    # Categories
    categories = ["Frames", "Mugs", "Hampers", "Gifts"]
    cat_objs = {}
    for cat_name in categories:
        cat = db.query(Category).filter(Category.name == cat_name).first()
        if not cat:
            cat = Category(name=cat_name, description=f"Custom photo {cat_name.lower()}")
            db.add(cat)
        cat_objs[cat_name] = cat # Store by name
    
    db.commit()
    
    # Products
    if not db.query(Product).first():
    # Create Products
        products_data = [
            {
                "name": "Classic Wood Photo Frame",
                "description": "Elegant wooden photo frame for YOUR most precious memories.",
                "price": 299.0,
                "stock": 50,
                "category_id": cat_objs["Frames"].id,
                "customization_type": "photo_frame",
                "has_customization": True,
                "is_on_home": True,
                "image_url": "/assets/classic_wood_frame.png",
                "customization_schema": {
                    "type": "Frame",
                    "sizes": [
                        {"label": "4x4 – Mini", "value": "4x4 – Mini", "width": 4, "height": 4, "price": 0, "enabled": True},
                        {"label": "8x6 – A5", "value": "8x6 – A5", "width": 8, "height": 6, "price": 150, "enabled": True},
                        {"label": "12x8 – A4", "value": "12x8 – A4", "width": 12, "height": 8, "price": 280, "enabled": True}
                    ],
                    "styles": [
                        {"label": "Wooden Frame", "type": "wooden", "value": "wooden", "enabled": True},
                        {"label": "Canvas Frame", "type": "canvas", "value": "canvas", "enabled": True}
                    ]
                }
            },
            {
                "name": "Magic Coffee Mug",
                "description": "A mug that reveals your photo when hot liquid is poured.",
                "price": 199.0,
                "stock": 100,
                "category_id": cat_objs["Mugs"].id,
                "customization_type": "custom_mug",
                "has_customization": True,
                "is_on_home": True,
                "image_url": "/assets/cat_mugs.png",
                "customization_schema": {
                    "type": "Mug",
                    "mugColors": [
                        {"label": "White", "value": "White", "hex": "#f5f5f0", "textColor": "#333", "enabled": True},
                        {"label": "Black", "value": "Black", "hex": "#222222", "textColor": "#fff", "enabled": True}
                    ],
                    "mugTypes": [
                        {"label": "Classic Mug (11oz)", "value": "Classic Mug (11oz)", "price": 0, "enabled": True},
                        {"label": "Large Mug (15oz)", "value": "Large Mug (15oz)", "price": 50, "enabled": True}
                    ]
                }
            },
            {
                "name": "Chocolate Gift hamper",
                "description": "Luxurious gift hamper with chocolates and decorations.",
                "price": 999.0,
                "stock": 20,
                "category_id": cat_objs["Hampers"].id,
                "customization_type": "chocolate_hamper",
                "has_customization": True,
                "is_on_home": True,
                "image_url": "/assets/luxury_hamper.png",
                "customization_schema": {
                    "type": "Hamper",
                    "hamperSizes": [
                        {"label": "Small", "value": "small", "maxChoc": 5, "price": 249, "enabled": True, "isPreset": True},
                        {"label": "Medium", "value": "medium", "maxChoc": 10, "price": 449, "enabled": True, "isPreset": True}
                    ],
                    "hamperContainers": [
                        {"label": "Wooden Box", "value": "wooden_box", "color": "#6D4C22", "enabled": True, "isPreset": True},
                        {"label": "Luxury Box", "value": "luxury_box", "color": "#1a1a2e", "enabled": True, "isPreset": True},
                        {"label": "Gift Basket", "value": "gift_basket", "color": "#8B6914", "enabled": True, "isPreset": True}
                    ],
                    "hamperChocolates": [
                        {"type": "dairymilk", "name": "Dairy Milk", "price": 60, "enabled": True, "isPreset": True},
                        {"type": "kitkat", "name": "KitKat", "price": 45, "enabled": True, "isPreset": True},
                        {"type": "ferrero", "name": "Ferrero Rocher", "price": 110, "enabled": True, "isPreset": True},
                        {"type": "snickers", "name": "Snickers", "price": 55, "enabled": True, "isPreset": True}
                    ]
                }
            },
            {
                "name": "Perfect Chocolate Gift Hamper", 
                "price": 499.0, 
                "category_id": cat_objs["Gifts"].id, 
                "customization_type": "chocolate_hamper", 
                "description": "Design your own luxurious chocolate hamper with premium treats and personal touches.", 
                "stock": 40, 
                "has_customization": True, 
                "is_on_home": True, 
                "image_url": "/assets/perfect_chocolate_hamper.png",
                "customization_schema": {
                    "type": "Hamper",
                    "hamperSizes": [
                        {"label": "Small", "value": "small", "maxChoc": 5, "price": 249, "enabled": True, "isPreset": True},
                        {"label": "Medium", "value": "medium", "maxChoc": 10, "price": 449, "enabled": True, "isPreset": True},
                        {"label": "Premium", "value": "premium", "maxChoc": 20, "price": 1099, "enabled": True, "isPreset": True}
                    ],
                    "hamperContainers": [
                        {"label": "Wooden Box", "value": "wooden_box", "color": "#6D4C22", "enabled": True, "isPreset": True},
                        {"label": "Luxury Box", "value": "luxury_box", "color": "#1a1a2e", "enabled": True, "isPreset": True},
                        {"label": "Gift Basket", "value": "gift_basket", "color": "#8B6914", "enabled": True, "isPreset": True}
                    ],
                    "hamperChocolates": [
                        {"type": "dairymilk", "name": "Dairy Milk", "price": 60, "enabled": True, "isPreset": True},
                        {"type": "kitkat", "name": "KitKat", "price": 45, "enabled": True, "isPreset": True},
                        {"type": "ferrero", "name": "Ferrero Rocher", "price": 110, "enabled": True, "isPreset": True},
                        {"type": "snickers", "name": "Snickers", "price": 55, "enabled": True, "isPreset": True},
                        {"type": "lindt", "name": "Lindt", "price": 130, "enabled": True, "isPreset": True},
                        {"type": "toblerone", "name": "Toblerone", "price": 180, "enabled": True, "isPreset": True}
                    ]
                }
            },
        ]
        for p_data in products_data: # Changed to products_data
            p = Product(**p_data)
            db.add(p)
    
    db.commit()
    db.close()
    print("Database initialized with sample data.")

if __name__ == "__main__":
    init_db()
