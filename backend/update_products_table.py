import os
import sys
# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import engine

def upgrade_database():
    print("Checking database schema for products table...")
    try:
        with engine.connect() as conn:
            try:
                print("Attempting to add 'secondary_images' column to 'products' table...")
                conn.execute(text("ALTER TABLE products ADD COLUMN secondary_images JSON NULL"))
                conn.commit()
                print("Column 'secondary_images' added successfully!")
            except Exception as e:
                # Standardize error check for MySQL/SQLite
                e_str = str(e).lower()
                if "duplicate column" in e_str or "already exists" in e_str:
                    print("Column 'secondary_images' already exists.")
                else:
                    print(f"Error adding column: {e}")
            
    except Exception as e:
        print(f"Error connecting to database: {e}")

if __name__ == "__main__":
    upgrade_database()
