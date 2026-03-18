
import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.session import SessionLocal
from app.models.models import Order, OrderItem, Product
from app.schemas.order import OrderOut
import json

def check_data_consistency():
    db = SessionLocal()
    try:
        orders = db.query(Order).all()
        print(f"Total orders: {len(orders)}")
        for order in orders:
            try:
                # Attempt to validate with Pydantic
                # We need to convert it to a dict that OrderOut can handle
                # Since OrderOut uses from_attributes=True, we can just pass the object
                OrderOut.model_validate(order)
            except Exception as e:
                print(f"Order ID {order.id} failed validation: {e}")
                # Print details about why it failed
                for item in order.items:
                    print(f"  Item ID {item.id}, product_id: {item.product_id}, product: {item.product}")
                    if item.product_id and not item.product:
                         print(f"  WARNING: Product {item.product_id} NOT FOUND for OrderItem {item.id}")
                
        db.close()
    except Exception as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    check_data_consistency()
