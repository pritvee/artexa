from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.models import Category, User, Product
from app.core import security

def seed():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create categories
        categories = [
            Category(id=1, name="Photo Frames", description="Customizable wooden and metal frames"),
            Category(id=2, name="Custom Mugs", description="High-quality ceramic mugs with your design"),
            Category(id=3, name="Gift Boxes", description="Curated gift boxes for every occasion"),
            Category(id=4, name="Hampers", description="Chocolate and sweets hampers"),
        ]
        for c in categories:
            if not db.query(Category).filter(Category.id == c.id).first():
                db.add(c)
        db.commit()

        # Create Admin
        admin_email = "admin@artexa.com"
        if not db.query(User).filter(User.email == admin_email).first():
            admin = User(
                name="ArtexA Admin",
                email=admin_email,
                hashed_password=security.get_password_hash("admin123"),
                role="admin",
                phone="9876543210"
            )
            db.add(admin)
            db.commit()

        # Create some sample products if none exist
        if db.query(Product).count() == 0:
            products = [
                Product(name="Luxury Teak Frame", description="Elegant handcarved teak wood frame.", price=1299.0, stock=50, category_id=1, customization_type="Frame", image_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400"),
                Product(name="Magic Photo Mug", description="Heat-sensitive mug that reveals photo.", price=499.0, stock=100, category_id=2, customization_type="Mug", image_url="https://images.unsplash.com/photo-1514228742587-6b1558fbed20?w=400"),
                Product(name="Birthday Gift Box", description="Perfect curated box for birthdays.", price=2499.0, stock=20, category_id=3, customization_type="Hamper", image_url="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400"),
            ]
            db.add_all(products)
            db.commit()

        print("Seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
