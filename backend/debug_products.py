from app.db.session import SessionLocal
from app.models.models import Product

db = SessionLocal()
products = db.query(Product).all()
for p in products:
    print(f"ID: {p.id}, Image URL: {p.image_url}")
db.close()
