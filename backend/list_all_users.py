
from sqlalchemy import create_engine, text
import os

DB_URL = "mysql+pymysql://root:Root%40123@localhost:3306/artexa_db"
engine = create_engine(DB_URL)

def check_users():
    try:
        with engine.connect() as conn:
            print("Checking all users...")
            result = conn.execute(text("SELECT id, email, hashed_password FROM users"))
            for row in result:
                user_id, email, hashed = row
                print(f"ID: {user_id} | Email: {email} | Hash: {hashed}")
                if hashed and hashed.startswith("b'"):
                    print(f"  --> FOUND POTENTIALLY BROKEN HASH for {email}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users()
