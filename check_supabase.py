import os
from sqlalchemy import create_engine, text

# Supabase Connection
DATABASE_URL = "postgresql://postgres:p1r2i3t4@@@db.zpgwhrbpgjofdoayfvzd.supabase.co:5432/postgres"

def check_admin():
    engine = create_engine(DATABASE_URL)
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT email, role FROM users WHERE email = 'admin@artexa.com'"))
            user = result.fetchone()
            if user:
                print(f"✅ FOUND USER: {user[0]} with role: {user[1]}")
            else:
                print("❌ USER NOT FOUND: admin@artexa.com does not exist in the database.")
                
            # Check products count
            result = conn.execute(text("SELECT count(*) FROM products"))
            count = result.scalar()
            print(f"📦 Product Count: {count}")
            
    except Exception as e:
        print(f"🔥 CONNECTION ERROR: {e}")

if __name__ == "__main__":
    check_admin()
