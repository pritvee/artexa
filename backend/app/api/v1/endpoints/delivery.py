from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import DeliveryTracking, Order
from app.api.v1.endpoints.auth import get_current_active_admin
from typing import Optional
from datetime import datetime
router = APIRouter()

from app.core.email import EmailService

@router.patch("/{order_id}/update-tracking")
def update_delivery(
    order_id: int,
    status: str,
    courier_partner: Optional[str] = None,
    tracking_id: Optional[str] = None,
    estimated_delivery: Optional[str] = None,
    admin=Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status
    if courier_partner is not None:
        order.courier_partner = courier_partner
    if tracking_id is not None:
        order.tracking_id = tracking_id
    if estimated_delivery is not None and estimated_delivery.strip():
        try:
            order.estimated_delivery = datetime.strptime(estimated_delivery.split('T')[0], "%Y-%m-%d")
        except ValueError:
            pass
            
    # Also update DeliveryTracking table for backward compatibility if used elsewhere
    tracking = db.query(DeliveryTracking).filter(DeliveryTracking.order_id == order_id).first()
    if not tracking:
        tracking = DeliveryTracking(order_id=order_id)
        db.add(tracking)
    
    tracking.status = status
    if courier_partner is not None:
        tracking.courier_partner = courier_partner
    if tracking_id is not None:
        tracking.tracking_id = tracking_id
    if estimated_delivery is not None and estimated_delivery.strip():
        try:
            tracking.estimated_delivery = datetime.strptime(estimated_delivery.split('T')[0], "%Y-%m-%d")
        except ValueError:
            pass
    
    db.commit()

    
    EmailService.send_order_notification(db, order.user_id, order_id, status)
    return tracking


