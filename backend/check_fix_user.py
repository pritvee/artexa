from sqlalchemy import create_engine, text
from passlib.context import CryptContext

DB_URL = "mysql+pymysql://root:Root%40123@localhost:3306/artexa_db"
engine = create_engine(DB_URL)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

with engine.connect() as conn:
    result = conn.execute(text("SELECT id, email, is_active, is_admin FROM users ORDER BY id"))
    rows = result.fetchall()
    print(f"Total users: {len(rows)}")
    for row in rows:
        print(f"\n  ID: {row[0]}")
        print(f"  Email: [{row[1]}]")
        print(f"  Active: {row[2]}")
        print(f"  Admin: {row[3]}")

# Check if prithvi@gmail.com exists
with engine.connect() as conn:
    result = conn.execute(text("SELECT id, email FROM users WHERE email = 'prithvi@gmail.com'"))
    user = result.fetchone()
    if user:
        print(f"\n✅ Found user prithvi@gmail.com with ID {user[0]}")
    else:
        print("\n❌ User prithvi@gmail.com NOT found in database!")
        print("   Creating user now...")
        hashed = pwd_context.hash("p1r2i3t4")
        conn.execute(text("""
            INSERT INTO users (email, hashed_password, full_name, is_active, is_admin)
            VALUES ('prithvi@gmail.com', :hashed, 'Prithvi', 1, 0)
        """), {"hashed": hashed})
        conn.commit()
        print("   ✅ User created successfully: prithvi@gmail.com / p1r2i3t4")
