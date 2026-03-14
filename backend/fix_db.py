import os
import sys
# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import engine

def upgrade_database():
    print("Checking database schema...")
    try:
        with engine.connect() as conn:
            # Check if columns exist
            # Note: MySQL syntax
            print("Checking for is_deleted...")
            result = conn.execute(text("SHOW COLUMNS FROM orders LIKE 'is_deleted'"))
            if not result.fetchone():
                print("Adding 'is_deleted' column...")
                conn.execute(text("ALTER TABLE orders ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE"))
            else:
                print("'is_deleted' already exists.")
            
            print("Checking for deleted_at...")
            result = conn.execute(text("SHOW COLUMNS FROM orders LIKE 'deleted_at'"))
            if not result.fetchone():
                print("Adding 'deleted_at' column...")
                conn.execute(text("ALTER TABLE orders ADD COLUMN deleted_at DATETIME NULL"))
            else:
                print("'deleted_at' already exists.")
            
            conn.commit()
            print("Database schema update completed!")
    except Exception as e:
        print(f"Error updating database: {e}")

if __name__ == "__main__":
    upgrade_database()
