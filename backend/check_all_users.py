from sqlalchemy import create_engine, text
import os

# Try both MySQL and SQLite
DB_URLS = [
    "mysql+pymysql://root:Root%40123@localhost:3306/artexa_db",
    "sqlite:///d:/project/photoframe website/backend/sql_app.db"
]

def check_all():
    for db_url in DB_URLS:
        try:
            print(f"\n--- Checking {db_url} ---")
            engine = create_engine(db_url)
            with engine.connect() as conn:
                result = conn.execute(text("SELECT id, email, hashed_password, role FROM users"))
                for row in result:
                    print(f"ID: {row[0]} | Email: {row[1]} | Hash: {row[2]} | Role: {row[3]}")
        except Exception as e:
            print(f"Error connecting to {db_url}: {e}")

if __name__ == '__main__':
    check_all()
