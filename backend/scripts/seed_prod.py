
import sys
import os
from datetime import datetime

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.models import User, Category, Product
from app.core.security import get_password_hash

def seed_database():
    print("🚀 Initializing Production Database...")
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    print("✅ Tables initialized.")

    db: Session = SessionLocal()
    try:
        # 1. Create Admin User
        admin_email = "admin@artexa.in"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            print(f"👤 Creating admin user: {admin_email}")
            admin_user = User(
                email=admin_email,
                name="Artexa Admin",
                hashed_password=get_password_hash("Admin@123"), # User should change this
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Admin user created.")
        else:
            print("ℹ️ Admin user already exists.")

        # 2. Create Categories
        categories_data = [
            {"name": "Personalized Frames", "description": "Custom photo frames for every occasion"},
            {"name": "Gift Hampers", "description": "Curated boxes filled with love"},
            {"name": "Customized Mugs", "description": "Start your day with a memory"}
        ]
        
        category_objects = {}
        for cat_info in categories_data:
            cat = db.query(Category).filter(Category.name == cat_info["name"]).first()
            if not cat:
                print(f"📂 Creating category: {cat_info['name']}")
                cat = Category(**cat_info)
                db.add(cat)
                db.commit()
                db.refresh(cat)
            category_objects[cat.name] = cat
        print("✅ Categories verified.")

        # 3. Create Sample Products
        products_data = [
            {
                "name": "Classic Wooden Frame",
                "description": "A timeless 8x10 wooden frame for your best memories.",
                "price": 499.0,
                "stock": 50,
                "category_id": category_objects["Personalized Frames"].id,
                "customization_type": "Frame",
                "has_customization": True,
                "is_on_home": True,
                "is_on_shop": True
            },
            {
                "name": "Luxury Chocolate Hamper",
                "description": "Assorted premium chocolates in a beautiful gift box.",
                "price": 1299.0,
                "stock": 20,
                "category_id": category_objects["Gift Hampers"].id,
                "customization_type": "Hamper",
                "has_customization": True,
                "is_on_home": True,
                "is_on_shop": True
            }
        ]

        for prod_info in products_data:
            prod = db.query(Product).filter(Product.name == prod_info["name"]).first()
            if not prod:
                print(f"🎁 Creating product: {prod_info['name']}")
                prod = Product(**prod_info)
                db.add(prod)
                db.commit()
        print("✅ Products verified.")

        print("🎊 Production Setup Complete!")
        print(f"🔑 You can now login with: {admin_email} / Admin@123")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
