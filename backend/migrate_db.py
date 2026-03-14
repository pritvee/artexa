
from sqlalchemy import create_engine, text
from app.db.session import engine

def migrate():
    with engine.connect() as conn:
        print("Checking for columns in products table...")
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN is_on_home BOOLEAN DEFAULT 0"))
            print("Added is_on_home column")
        except Exception as e:
            print(f"is_on_home column might already exist: {e}")
            
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN is_on_shop BOOLEAN DEFAULT 1"))
            print("Added is_on_shop column")
        except Exception as e:
            print(f"is_on_shop column might already exist: {e}")
        
        conn.commit()
    print("Migration finished")

if __name__ == "__main__":
    import sys
    import os
    sys.path.append(os.getcwd())
    migrate()
