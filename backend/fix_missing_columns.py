
import sys
import os
from sqlalchemy import text, inspect
from app.db.session import engine

def fix_schema():
    print("Starting database schema fix...")
    inspector = inspect(engine)
    
    # Check orders table
    columns = [c['name'] for c in inspector.get_columns('orders')]
    print(f"Current columns in 'orders': {columns}")
    
    with engine.connect() as conn:
        # Add is_deleted if missing
        if 'is_deleted' not in columns:
            print("Adding 'is_deleted' to 'orders'...")
            try:
                conn.execute(text("ALTER TABLE orders ADD COLUMN is_deleted BOOLEAN DEFAULT 0"))
                print("Added is_deleted")
            except Exception as e:
                print(f"Error adding is_deleted: {e}")
        
        # Add deleted_at if missing
        if 'deleted_at' not in columns:
            print("Adding 'deleted_at' to 'orders'...")
            try:
                conn.execute(text("ALTER TABLE orders ADD COLUMN deleted_at DATETIME NULL"))
                print("Added deleted_at")
            except Exception as e:
                print(f"Error adding deleted_at: {e}")

        # Add cart_item_ids if missing
        if 'cart_item_ids' not in columns:
            print("Adding 'cart_item_ids' to 'orders'...")
            try:
                # For SQLite/MySQL we use TEXT or JSON. 
                # SQLAlchemy JSON usually maps to TEXT in SQLite or JSON in MySQL 5.7+
                column_type = "JSON" if engine.name == 'mysql' else "TEXT"
                conn.execute(text(f"ALTER TABLE orders ADD COLUMN cart_item_ids {column_type} NULL"))
                print(f"Added cart_item_ids as {column_type}")
            except Exception as e:
                print(f"Error adding cart_item_ids: {e}")

        # Add courier fields if missing
        for col in ['courier_partner', 'tracking_id', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature']:
            if col not in columns:
                print(f"Adding '{col}' to 'orders'...")
                try:
                    conn.execute(text(f"ALTER TABLE orders ADD COLUMN {col} VARCHAR(255) NULL"))
                except Exception as e:
                    print(f"Error adding {col}: {e}")

        if 'estimated_delivery' not in columns:
            print("Adding 'estimated_delivery' to 'orders'...")
            try:
                conn.execute(text("ALTER TABLE orders ADD COLUMN estimated_delivery DATETIME NULL"))
            except Exception as e:
                print(f"Error adding estimated_delivery: {e}")

        # Also check products table for is_on_home and is_on_shop
        p_columns = [c['name'] for c in inspector.get_columns('products')]
        if 'is_on_home' not in p_columns:
            print("Adding 'is_on_home' to 'products'...")
            try:
                conn.execute(text("ALTER TABLE products ADD COLUMN is_on_home BOOLEAN DEFAULT 0"))
            except Exception as e:
                print(f"Error adding is_on_home: {e}")
        
        if 'is_on_shop' not in p_columns:
            print("Adding 'is_on_shop' to 'products'...")
            try:
                conn.execute(text("ALTER TABLE products ADD COLUMN is_on_shop BOOLEAN DEFAULT 1"))
            except Exception as e:
                print(f"Error adding is_on_shop: {e}")

        conn.commit()
    print("Schema fix completed.")

if __name__ == "__main__":
    # Add current dir to path to import app
    sys.path.append(os.getcwd())
    fix_schema()
