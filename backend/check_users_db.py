
from sqlalchemy import create_engine, text
import os

# Assume SQLite for now based on list_dir output showing sql_app.db
DB_URL = "sqlite:///d:/project/photoframe website/backend/sql_app.db"
engine = create_engine(DB_URL)

def check_users():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT id, email, hashed_password FROM users LIMIT 5"))
        for row in result:
            print(f"ID: {row[0]}, Email: {row[1]}, Hashed Password: {row[2]}")
            # Check if it starts with 'b' and quotes
            if isinstance(row[2], str) and row[2].startswith("b'") and row[2].endswith("'"):
                print("  WARNING: This looks like a string representation of bytes!")

if __name__ == "__main__":
    check_users()
