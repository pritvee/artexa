
from sqlalchemy import create_engine, text

DB_URL = "mysql+pymysql://root:Root%40123@localhost:3306/artexa_db"
engine = create_engine(DB_URL)

def check_for_broken_hashes():
    with engine.connect() as conn:
        print("Checking users...")
        result = conn.execute(text("SELECT email, hashed_password FROM users WHERE hashed_password LIKE 'b''%'''"))
        rows = result.fetchall()
        for row in rows:
            print(f"BROKEN HASH FOUND: {row[0]}")
            
        print("Checking admins...")
        result = conn.execute(text("SELECT email, hashed_password FROM admins WHERE hashed_password LIKE 'b''%'''"))
        rows = result.fetchall()
        for row in rows:
            print(f"BROKEN HASH FOUND: {row[0]}")

if __name__ == "__main__":
    check_for_broken_hashes()
