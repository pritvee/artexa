from app.db.session import SessionLocal
from app.models.models import User
from app.core import security

db = SessionLocal()
users = db.query(User).all()

print(f"{'ID':<4} | {'Email':<25} | {'Role':<10} | {'Is Hashed':<10}")
print("-" * 60)

for user in users:
    # Basic check if it looks like a bcrypt hash (starts with $2b$)
    is_hashed = user.hashed_password.startswith("$2") if user.hashed_password else False
    print(f"{user.id:<4} | {user.email:<25} | {user.role:<10} | {is_hashed}")

db.close()
