from app.db.session import SessionLocal
from app.models.models import User

db = SessionLocal()
users = db.query(User).all()
print("-" * 50)
print(f"{'ID':<5} | {'Email':<25} | {'Name':<15} | {'Role':<10}")
print("-" * 50)
for u in users:
    print(f"{u.id:<5} | {u.email:<25} | {u.name:<15} | {u.role:<10}")
print("-" * 50)
