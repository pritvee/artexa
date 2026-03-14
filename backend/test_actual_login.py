
from sqlalchemy import create_engine, text
from app.core import security

DB_URL = "mysql+pymysql://root:Root%40123@localhost:3306/artexa_db"
engine = create_engine(DB_URL)

def test_login():
    email = "admin@example.com"
    pwd = "admin123"
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT hashed_password FROM users WHERE email = :email"), {"email": email})
        row = result.fetchone()
        if row:
            hashed = row[0]
            print(f"Found user {email}")
            print(f"Hashed in DB: {hashed}")
            is_valid = security.verify_password(pwd, hashed)
            print(f"Verification result for '{pwd}': {is_valid}")
        else:
            print(f"User {email} not found")

if __name__ == "__main__":
    test_login()
