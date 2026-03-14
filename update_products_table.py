import os
import sys
# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from backend.app.db.session import engine

def upgrade_database():
    print("Checking database schema for products table...")
    try:
        with engine.connect() as conn:
            # Check for secondary_images column
            # This is a bit tricky to do generically for both MySQL and SQLite, 
            # so let's try a simple approach or just try to add it.
            try:
                print("Attempting to add 'secondary_images' column to 'products' table...")
                conn.execute(text("ALTER TABLE products ADD COLUMN secondary_images JSON NULL"))
                conn.commit()
                print("Column 'secondary_images' added successfully!")
            except Exception as e:
                if "Duplicate column name" in str(e) or "already exists" in str(e):
                    print("Column 'secondary_images' already exists.")
                else:
                    print(f"Error adding column: {e}")
            
    except Exception as e:
        print(f"Error connecting to database: {e}")

if __name__ == "__main__":
    upgrade_database()
