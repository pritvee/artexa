from app.db.session import SessionLocal
from app.models.models import Order, User, Product
from sqlalchemy import func

def test_queries():
    db = SessionLocal()
    try:
        # test dashboard queries
        total_orders = db.query(Order).filter(Order.is_deleted == False).count()
        total_users = db.query(User).count()
        total_revenue = db.query(func.sum(Order.total_price)).filter(Order.is_deleted == False).scalar() or 0
        total_products = db.query(Product).count()
        pending_orders = db.query(Order).filter(Order.status == "placed", Order.is_deleted == False).count()
        delivered_orders = db.query(Order).filter(Order.status == "delivered", Order.is_deleted == False).count()
        
        recent_orders = db.query(Order).filter(Order.is_deleted == False).order_by(Order.created_at.desc()).limit(5).all()
        
        print("SUCCESS! DB queries executed correctly.")
        print(f"Total orders: {total_orders}")
        print(f"Total revenue: {total_revenue}")
        print(f"Total users: {total_users}")
        print(f"Pending orders: {pending_orders}")
        
    except Exception as e:
        print(f"Error executing queries: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_queries()
