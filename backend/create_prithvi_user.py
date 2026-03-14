import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.models import User
from app.core.security import get_password_hash, verify_password

db = SessionLocal()

EMAIL = "prithvi@gmail.com"
PASSWORD = "p1r2i3t4"

print("=== All current users ===")
users = db.query(User).all()
for u in users:
    print(f"  ID:{u.id} | Email:[{u.email}] | Name:{u.name} | Role:{u.role} | Active:{u.is_active}")

print()
user = db.query(User).filter(User.email == EMAIL).first()

if user:
    print(f"Found user [{EMAIL}] — resetting password...")
    user.hashed_password = get_password_hash(PASSWORD)
    user.is_active = True
    db.commit()
    print(f"Password reset done!")
else:
    print(f"User [{EMAIL}] not found — creating...")
    new_user = User(
        email=EMAIL,
        name="Prithvi",
        hashed_password=get_password_hash(PASSWORD),
        role="user",
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print(f"User created with ID: {new_user.id}")

# Verify
user = db.query(User).filter(User.email == EMAIL).first()
ok = verify_password(PASSWORD, user.hashed_password)
print(f"\n✅ Verification: password '{PASSWORD}' matches = {ok}")
print(f"   Email: {user.email}")
print(f"   Name: {user.name}")
print(f"   Role: {user.role}")
print(f"   Active: {user.is_active}")
print("\n✅ You can now login with:")
print(f"   Email:    {EMAIL}")
print(f"   Password: {PASSWORD}")
db.close()
