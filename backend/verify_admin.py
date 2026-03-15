from app.db.session import SessionLocal
from app.models.models import User
from app.core import security

db = SessionLocal()
email = "admin@example.com"
u = db.query(User).filter(User.email == email).first()

if u:
    print(f"User: {u.email}")
    print(f"Role: {u.role}")
    # Try common passwords if unknown, but here we just check if it's verifiable
    # Assuming 'admin' was the likely password for admin@example.com
    is_correct = security.verify_password("admin", u.hashed_password)
    print(f"Verify 'admin': {is_correct}")
else:
    print("User not found")

db.close()
