from app.db.session import SessionLocal
from app.models.models import User
from app.core import security

db = SessionLocal()
users = [
    ("admin@example.com", "admin", "admin"),
    ("testuser@example.com", "password123", "user"),
    ("prit@gmail.com", "password123", "user"),
    ("prithvi@gmail.com", "password123", "user")
]

for email, password, role in users:
    u = db.query(User).filter(User.email == email).first()
    if u:
        u.hashed_password = security.get_password_hash(password)
        print(f"Updated {email} password to '{password}'")

db.commit()
db.close()
print("All passwords reset successfully.")
