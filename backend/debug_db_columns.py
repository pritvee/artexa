from sqlalchemy import create_engine, inspect
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
engine = create_engine(db_url)
inspector = inspect(engine)

print(f"Checking columns for table 'orders' in {db_url.split('://')[0]}...")
columns = inspector.get_columns('orders')
for column in columns:
    print(f" - {column['name']} ({column['type']})")

print("\nChecking columns for table 'order_items'...")
columns = inspector.get_columns('order_items')
for column in columns:
    print(f" - {column['name']} ({column['type']})")
