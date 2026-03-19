import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.getcwd(), 'backend')))

from backend.app.core.config import settings
from backend.app.models.models import User, Product, Category, Order, Cart

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def check_integrity():
    db = SessionLocal()
    print("--- Integrity Check ---")
    try:
        # Check users without carts
        users = db.query(User).all()
        for u in users:
            cart = db.query(Cart).filter(Cart.user_id == u.id).first()
            if not cart:
                print(f"FIX: User {u.email} (ID {u.id}) has no cart. Creating one...")
                db.add(Cart(user_id=u.id))
        
        # Check products without valid categories
        products = db.query(Product).all()
        valid_cat_ids = [c.id for c in db.query(Category).all()]
        for p in products:
            if p.category_id not in valid_cat_ids:
                print(f"WARNING: Product {p.name} (ID {p.id}) has invalid category_id {p.category_id}")
        
        db.commit()
        print("Integrity check completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_integrity()
