from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import os
import sys

# Add backend to path to import models
backend_path = os.path.abspath(os.path.join(os.getcwd(), 'backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from backend.app.core.config import settings
from backend.app.models.models import Product, Category

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_db():
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        print(f"Total products: {len(products)}")
        for p in products:
            print(f"ID: {p.id}, Name: {p.name}, Price: {p.price}, Category: {p.category_id}")
        
        categories = db.query(Category).all()
        print(f"\nTotal categories: {len(categories)}")
        for c in categories:
            print(f"ID: {c.id}, Name: {c.name}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
