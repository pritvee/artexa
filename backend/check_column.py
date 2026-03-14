
from sqlalchemy import create_engine, text

DB_URL = "mysql+pymysql://root:Root%40123@localhost:3306/artexa_db"
engine = create_engine(DB_URL)

def check_column_type():
    with engine.connect() as conn:
        result = conn.execute(text("DESCRIBE users"))
        for row in result:
            if row[0] == 'hashed_password':
                print(f"Column: {row[0]}, Type: {row[1]}, Null: {row[2]}, Key: {row[3]}")

if __name__ == "__main__":
    check_column_type()
