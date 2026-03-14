
from sqlalchemy import create_engine, text
import os

# Check SQLite
if os.path.exists("d:/project/photoframe website/backend/sql_app.db"):
    print("Checking SQLite database (sql_app.db)...")
    engine = create_engine("sqlite:///d:/project/photoframe website/backend/sql_app.db")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT id, email, hashed_password FROM users"))
            users = result.fetchall()
            if users:
                for row in users:
                    print(f"ID: {row[0]}, Email: {row[1]}, Hash: {row[2][:15]}...")
            else:
                print("No users in SQLite.")
    except Exception as e:
        print(f"Error checking SQLite: {e}")
else:
    print("SQLite database not found.")
