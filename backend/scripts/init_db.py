
import sys
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Add current directory to path
sys.path.append(os.getcwd())

# Import Base and Engine
from app.db.base import Base
from app.db.session import engine, SQLALCHEMY_DATABASE_URL

def init_db():
    print(f"DEBUG: Initializing database at {SQLALCHEMY_DATABASE_URL.split('@')[-1]}")
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("SUCCESS: All tables created successfully.")
        
        # Verify tables
        with engine.connect() as conn:
            from sqlalchemy import inspect
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            print(f"Existing tables: {tables}")
            
            if 'categories' not in tables:
                print("WARNING: 'categories' table still missing!")
            if 'products' not in tables:
                print("WARNING: 'products' table still missing!")
                
    except Exception as e:
        print(f"ERROR during DB initialization: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    init_db()
