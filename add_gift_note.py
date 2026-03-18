import sys
import os
from sqlalchemy import text
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app.db.session import engine

def add_columns():
    with engine.connect() as conn:
        try:
            # Render's postgres or any other DB
            conn.execute(text("ALTER TABLE orders ADD COLUMN gift_note VARCHAR(1000) NULL;"))
            try:
                # some DB drivers require explicit commit, some auto-commit on DDL
                conn.commit()
            except Exception:
                pass
            print("Successfully added gift_note to orders")
        except Exception as e:
            print(f"Error adding gift_note: {e}")

if __name__ == "__main__":
    add_columns()
