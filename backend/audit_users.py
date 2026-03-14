
from sqlalchemy import create_engine, text
import os

DB_URL = "mysql+pymysql://root:Root%40123@localhost:3306/artexa_db"
engine = create_engine(DB_URL)

def check_users():
    try:
        with engine.connect() as conn:
            print("Checking all users in 'users' table...")
            result = conn.execute(text("SELECT id, email, hashed_password, role FROM users"))
            for row in result:
                user_id, email, hashed, role = row
                print(f"ID: {user_id} | Email: {email} | Role: {role}")
                if not hashed:
                    print("  [DEBUG] HASHED_PASSWORD IS NULL OR EMPTY!")
                elif hashed.startswith("$2b$") or hashed.startswith("$2a$"):
                    print("  [DEBUG] Hash looks like valid bcrypt.")
                else:
                    print(f"  [DEBUG] Hash format UNKNOWN: {hashed[:10]}...")

            print("\nChecking all admins in 'admins' table...")
            result = conn.execute(text("SELECT id, email, hashed_password FROM admins"))
            for row in result:
                user_id, email, hashed = row
                print(f"ID: {user_id} | Email: {email}")
                if not hashed:
                    print("  [DEBUG] HASHED_PASSWORD IS NULL OR EMPTY!")
                elif hashed.startswith("$2b$") or hashed.startswith("$2a$"):
                    print("  [DEBUG] Hash looks like valid bcrypt.")
                else:
                    print(f"  [DEBUG] Hash format UNKNOWN: {hashed[:10]}...")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users()
