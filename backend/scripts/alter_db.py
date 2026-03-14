from app.db.session import engine
from sqlalchemy import text

def alter_db():
    with engine.connect() as con:
        try:
            con.execute(text("ALTER TABLE products ADD COLUMN has_customization BOOLEAN DEFAULT 0"))
        except Exception as e:
            print("has_customization already exists or error:", e)
        try:
            con.execute(text("ALTER TABLE products ADD COLUMN customization_schema JSON"))
        except Exception as e:
            print("customization_schema already exists or error:", e)
        try:
            con.execute(text("ALTER TABLE cart_items ADD COLUMN preview_image_url VARCHAR(255)"))
        except Exception as e:
            print("cart_items preview_image_url already exists or error:", e)
        try:
            con.execute(text("ALTER TABLE order_items ADD COLUMN preview_image_url VARCHAR(255)"))
        except Exception as e:
            print("order_items preview_image_url already exists or error:", e)
            
    print("Alter DB done.")

if __name__ == "__main__":
    alter_db()
