
from sqlalchemy import create_engine, text
import os

# Using the URL from config.py
DB_URL = "mysql+pymysql://root:Root%40123@localhost:3306/artexa_db"
engine = create_engine(DB_URL)

def check_users():
    try:
        with engine.connect() as conn:
            print("Checking users table...")
            result = conn.execute(text("SELECT id, email, hashed_password FROM users"))
            users = result.fetchall()
            if not users:
                print("No users found.")
            for row in users:
                print(f"ID: {row[0]}, Email: {row[1]}, Hash: {repr(row[2])}, Type: {type(row[2])}")
    except Exception as e:
        print(f"Error checking users: {e}")

    try:
        with engine.connect() as conn:
            print("\nChecking admins table...")
            result = conn.execute(text("SELECT id, email, hashed_password FROM admins"))
            admins = result.fetchall()
            if not admins:
                print("No admins found.")
            for row in admins:
                print(f"ID: {row[0]}, Email: {row[1]}, Hash: {repr(row[2])}, Type: {type(row[2])}")
    except Exception as e:
        print(f"Error checking admins (might not exist): {e}")

if __name__ == "__main__":
    check_users()
