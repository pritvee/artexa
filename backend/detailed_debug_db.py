
from sqlalchemy import create_engine, text
import os
import bcrypt

DB_URL = "mysql+pymysql://root:Root%40123@localhost:3306/artexa_db"
engine = create_engine(DB_URL)

def check_users():
    try:
        with engine.connect() as conn:
            print("Checking users table...")
            result = conn.execute(text("SELECT id, email, hashed_password FROM users"))
            users = result.fetchall()
            for row in users:
                user_id, email, hashed = row
                print(f"ID: {user_id}, Email: {email}")
                if hashed:
                    print(f"  Hash: {hashed}")
                    print(f"  Type: {type(hashed)}")
                    if hashed.startswith("b'") or hashed.startswith('b"'):
                        print("  !!! CRITICAL: Hash appears to be a string representation of bytes (starts with b')")
                        # Try to fix it?
                else:
                    print("  Hash is None!")

            print("\nChecking admins table...")
            result = conn.execute(text("SELECT id, email, hashed_password FROM admins"))
            admins = result.fetchall()
            for row in admins:
                user_id, email, hashed = row
                print(f"ID: {user_id}, Email: {email}")
                if hashed:
                    print(f"  Hash: {hashed}")
                    if hashed.startswith("b'") or hashed.startswith('b"'):
                        print("  !!! CRITICAL: Hash appears to be a string representation of bytes (starts with b')")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users()
