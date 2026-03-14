
from sqlalchemy import create_engine, text

DB_URL = "mysql+pymysql://root:Root%40123@localhost:3306/artexa_db"
engine = create_engine(DB_URL)

def check_admins():
    try:
        with engine.connect() as conn:
            print("Checking all admins...")
            result = conn.execute(text("SELECT id, email, hashed_password FROM admins"))
            for row in result:
                user_id, email, hashed = row
                print(f"ID: {user_id} | Email: {email} | Hash: {hashed}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_admins()
