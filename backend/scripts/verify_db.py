
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add the current directory to sys.path to import app modules
sys.path.append(os.getcwd())

load_dotenv()

def test_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("ERROR: DATABASE_URL not found in environment.")
        return

    # Handle postgres protocol for SQLAlchemy
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    print(f"Testing connection to: {db_url.split('@')[-1]}") # Log host only

    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            print("SUCCESS: Connected to the database.")
            
            # Check products table
            try:
                result = conn.execute(text("SELECT count(*) FROM products"))
                count = result.scalar()
                print(f"SUCCESS: 'products' table exists. Row count: {count}")
                
                # Check for columns
                result = conn.execute(text("SELECT * FROM products LIMIT 1"))
                columns = result.keys()
                print(f"Columns in 'products': {list(columns)}")
            except Exception as e:
                print(f"ERROR: 'products' table issue: {e}")

            # Check categories table
            try:
                result = conn.execute(text("SELECT count(*) FROM categories"))
                count = result.scalar()
                print(f"SUCCESS: 'categories' table exists. Row count: {count}")
            except Exception as e:
                print(f"ERROR: 'categories' table issue: {e}")

    except Exception as e:
        print(f"CRITICAL ERROR: Could not connect to database: {e}")

if __name__ == "__main__":
    test_connection()
