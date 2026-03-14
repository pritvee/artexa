from sqlalchemy import create_engine, text
from passlib.context import CryptContext

engine = create_engine("mysql+pymysql://root:Root%40123@localhost:3306/artexa_db")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

with engine.connect() as conn:
    # Show all users
    result = conn.execute(text("SELECT id, name, email, is_active, role FROM users ORDER BY id"))
    rows = result.fetchall()
    print(f"Total users: {len(rows)}")
    for row in rows:
        print(f"  ID:{row[0]} | Name:{row[1]} | Email:[{row[2]}] | Active:{row[3]} | Role:{row[4]}")

    # Check for prithvi@gmail.com
    result2 = conn.execute(text("SELECT id FROM users WHERE email = 'prithvi@gmail.com'"))
    user = result2.fetchone()
    if user:
        print("\nFound prithvi@gmail.com - resetting password...")
        hashed = pwd_context.hash("p1r2i3t4")
        conn.execute(text("UPDATE users SET hashed_password = :h, is_active = 1 WHERE email = 'prithvi@gmail.com'"), {"h": hashed})
        conn.commit()
        print("Password reset done!")
    else:
        print("\nprithvi@gmail.com not found - creating account...")
        hashed = pwd_context.hash("p1r2i3t4")
        conn.execute(text("INSERT INTO users (name, email, hashed_password, is_active, role) VALUES ('Prithvi', 'prithvi@gmail.com', :h, 1, 'customer')"), {"h": hashed})
        conn.commit()
        print("User created successfully!")

print("\nDone! Try logging in with prithvi@gmail.com / p1r2i3t4")
