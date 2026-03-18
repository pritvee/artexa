
import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.session import engine
from sqlalchemy import inspect

def check_orders_columns():
    inspector = inspect(engine)
    columns = inspector.get_columns('orders')
    names = [col['name'] for col in columns]
    print("Columns in 'orders' table:")
    for name in names:
        print(f" - {name}")
    if 'is_deleted' in columns:
        print("'is_deleted' column exists.")
    else:
        print("'is_deleted' column MISSING!")
    
    if 'deleted_at' in columns:
        print("'deleted_at' column exists.")
    else:
        print("'deleted_at' column MISSING!")

if __name__ == "__main__":
    # Add project root to sys.path if needed
    sys.path.append(os.getcwd())
    try:
        check_orders_columns()
    except Exception as e:
        print(f"Error: {e}")
