from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.db.session import get_db
from app.models.models import Order, User, Product
from app.api.v1.endpoints.auth import get_current_active_admin
from app.schemas.order import OrderOut, DashboardStatsOut, OrderListOut
from app.schemas.product import ProductOut, ProductCreate
from typing import Dict, List

router = APIRouter()

@router.get("/dashboard-stats", response_model=DashboardStatsOut)
def get_dashboard_stats(
    admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    total_orders = db.query(Order).filter(Order.is_deleted == False).count()
    total_users = db.query(User).count()
    total_revenue = db.query(func.sum(Order.total_price)).filter(Order.is_deleted == False).scalar() or 0
    total_products = db.query(Product).count()
    pending_orders = db.query(Order).filter(Order.status == "placed", Order.is_deleted == False).count()
    delivered_orders = db.query(Order).filter(Order.status == "delivered", Order.is_deleted == False).count()
    
    recent_orders = db.query(Order).filter(Order.is_deleted == False).order_by(Order.created_at.desc()).limit(5).all()
    
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_users": total_users,
        "total_products": total_products,
        "pending_orders": pending_orders,
        "delivered_orders": delivered_orders,
        "recent_orders": recent_orders
    }

@router.get("/orders", response_model=OrderListOut)
def get_all_orders(
    page: int = 1,
    limit: int = 10,
    show_deleted: bool = False,
    admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    query = db.query(Order).filter(Order.is_deleted == show_deleted)
    total = query.count()
    items = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit
    }


from app.core.email import EmailService

@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str,
    admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    
    EmailService.send_order_notification(db, order.user_id, order_id, status)
    return order

@router.post("/products", response_model=ProductOut)
def create_product(
    product_in: ProductCreate,
    admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    db_product = Product(**product_in.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.patch("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    product_update: ProductCreate,
    admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_update.dict(exclude_unset=True).items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/orders/{order_id}")
def delete_order(
    order_id: int,
    admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.is_deleted = True
    order.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Order moved to trash"}

@router.post("/orders/{order_id}/recover")
def recover_order(
    order_id: int,
    admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.is_deleted = False
    order.deleted_at = None
    db.commit()
    return {"message": "Order recovered successfully"}

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    try:
        # 1. Fetch product and validate existence
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")
        
        # 2. Attempt deletion
        # Note: If product is referenced by OrderItems or CartItems, this will raise IntegrityError
        db.delete(db_product)
        db.commit()
        return {"message": "Product successfully deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        error_msg = str(e)
        
        # Catch foreign key violations (very common in e-commerce when deleting products used in orders)
        if "foreign key" in error_msg.lower() or "violates" in error_msg.lower():
            raise HTTPException(
                status_code=400, 
                detail="Cannot hard-delete product because it is referenced by existing orders. Please deactivate it (is_on_shop=False) instead to preserve order history."
            )
            
        print(f"CRITICAL ERROR: Failed to delete product {product_id}: {error_msg}")
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred while deleting the product: {error_msg}"
        )
