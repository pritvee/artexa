from app.core.security import verify_password
from sqlalchemy import create_engine, text

DB_URL = "mysql+pymysql://root:Root%40123@localhost:3306/artexa_db"
engine = create_engine(DB_URL)

def test_login():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT email, hashed_password FROM users"))
        for row in result:
            email, hashed = row
            print(f"DEBUG: {email} | Raw Hash: {repr(hashed)} | Type: {type(hashed)}")
            if email == 'admin@example.com':
                ok = verify_password("admin123", hashed)
                print(f"User: {email} | Pass: admin123 | Verified: {ok}")
            elif email == 'prithvi@gmail.com':
                ok = verify_password("p1r2i3t4", hashed)
                print(f"User: {email} | Pass: p1r2i3t4 | Verified: {ok}")
            elif email == 'testuser@example.com':
                ok = verify_password("testpass123", hashed)
                print(f"User: {email} | Pass: testpass123 | Verified: {ok}")

if __name__ == "__main__":
    test_login()
