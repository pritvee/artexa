from sqlalchemy import inspect, text, Column, Boolean, DateTime
from sqlalchemy.orm import Session
from app.db.session import engine
import logging

def ensure_columns():
    """
    Ensures that all required columns exist in the database.
    This is a simplified migration system that runs on startup.
    """
    inspector = inspect(engine)
    
    # 1. Check 'orders' table
    if 'orders' in inspector.get_table_names():
        columns = [c['name'] for c in inspector.get_columns('orders')]
        
        # Add is_deleted
        if 'is_deleted' not in columns:
            print("Migration: Adding 'is_deleted' column to 'orders' table")
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE orders ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE"))
                conn.commit()
                
        # Add deleted_at
        if 'deleted_at' not in columns:
            print("Migration: Adding 'deleted_at' column to 'orders' table")
            with engine.connect() as conn:
                # Use TIMESTAMP or DATETIME depending on DB
                try:
                    conn.execute(text("ALTER TABLE orders ADD COLUMN deleted_at DATETIME"))
                except Exception:
                    conn.execute(text("ALTER TABLE orders ADD COLUMN deleted_at TIMESTAMP"))
                conn.commit()

        # Add cart_item_ids if missing
        if 'cart_item_ids' not in columns:
            print("Migration: Adding 'cart_item_ids' column to 'orders' table")
            with engine.connect() as conn:
                try:
                    conn.execute(text("ALTER TABLE orders ADD COLUMN cart_item_ids JSON"))
                except Exception:
                    # Fallback to Text for old SQLite/DBs
                    conn.execute(text("ALTER TABLE orders ADD COLUMN cart_item_ids TEXT"))
                conn.commit()

        # Check and add other missing columns
        extra_columns = {
            'gift_note': 'VARCHAR(1000)',
            'courier_partner': 'VARCHAR(100)',
            'tracking_id': 'VARCHAR(100)',
            'estimated_delivery': 'DATETIME',
            'payment_method': 'VARCHAR(50) DEFAULT "online"',
            'payment_status': 'VARCHAR(50) DEFAULT "pending"',
            'razorpay_order_id': 'VARCHAR(100)',
            'razorpay_payment_id': 'VARCHAR(100)',
            'razorpay_signature': 'VARCHAR(255)'
        }
        for col_name, col_type in extra_columns.items():
            if col_name not in columns:
                print(f"Migration: Adding '{col_name}' column to 'orders' table")
                with engine.connect() as conn:
                    try:
                        sql_stmt = f"ALTER TABLE orders ADD COLUMN {col_name} {col_type}"
                        if col_type == 'DATETIME':
                            try:
                                conn.execute(text(sql_stmt))
                            except Exception:
                                conn.execute(text(f"ALTER TABLE orders ADD COLUMN {col_name} TIMESTAMP"))
                        else:
                            conn.execute(text(sql_stmt))
                        conn.commit()
                    except Exception as e:
                        print(f"Migration error for {col_name}: {e}")

    # 2. Check 'products' table
    if 'products' in inspector.get_table_names():
        columns = [c['name'] for c in inspector.get_columns('products')]
        if 'is_on_home' not in columns:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE products ADD COLUMN is_on_home BOOLEAN DEFAULT FALSE"))
                conn.commit()
        if 'is_on_shop' not in columns:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE products ADD COLUMN is_on_shop BOOLEAN DEFAULT TRUE"))
                conn.commit()

    # 3. Check 'order_items' table
    if 'order_items' in inspector.get_table_names():
        columns = [c['name'] for c in inspector.get_columns('order_items')]
        if 'preview_image_url' not in columns:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE order_items ADD COLUMN preview_image_url VARCHAR(255)"))
                conn.commit()

    print("Migration check completed.")
