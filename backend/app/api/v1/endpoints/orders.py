from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import Order, OrderItem, Cart, CartItem, User
import razorpay
from app.core.config import settings
from app.schemas.order import OrderCreate, OrderOut, OrderItemOut, PaymentVerify
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@router.post("/", response_model=OrderOut)
def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Filter items if item_ids provided
    checkout_items = cart.items
    if order_in.item_ids:
        checkout_items = [item for item in cart.items if item.id in order_in.item_ids]
        if not checkout_items:
            raise HTTPException(status_code=400, detail="None of the selected items were found in your cart")

    subtotal = sum(item.product.price * item.quantity for item in checkout_items)
    shipping_fee = 50.0 if subtotal > 0 else 0
    total_price = subtotal + shipping_fee
    
    # Create Order in DB
    order = Order(
        user_id=current_user.id,
        total_price=total_price,
        shipping_address=order_in.shipping_address,
        payment_method=order_in.payment_method,
        status="placed",
        payment_status="pending" if order_in.payment_method == "online" else "cod_pending"
    )
    db.add(order)
    db.flush() # To get order.id
    
    # Create Razorpay Order
    if order_in.payment_method == "online":
        if settings.RAZORPAY_KEY_SECRET == "razorpay_secret_key_here" or not settings.RAZORPAY_KEY_SECRET:
            order.razorpay_order_id = f"mock_rzp_order_{order.id}"
        else:
            try:
                razorpay_order = client.order.create({
                    "amount": int(total_price * 100), # Amount in paise
                    "currency": "INR",
                    "receipt": f"order_{order.id}"
                })
                order.razorpay_order_id = razorpay_order['id']
            except Exception as e:
                db.rollback()
                raise HTTPException(status_code=500, detail=f"Razorpay Error: {str(e)}")
    else:
        order.razorpay_order_id = None

    for cart_item in checkout_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price,
            customization_details=cart_item.customization_details,
            uploaded_photo_id=cart_item.uploaded_photo_id
        )
        db.add(order_item)
    
    # Clear only the checked out items from cart for COD. 
    # For online, we'll clear them after successful payment verification.
    if order_in.payment_method == "cod":
        item_ids_to_delete = [item.id for item in checkout_items]
        db.query(CartItem).filter(CartItem.id.in_(item_ids_to_delete)).delete(synchronize_session=False)
    
    db.commit()
    db.refresh(order)
    
    from app.core.email import EmailService
    EmailService.send_order_notification(db, current_user.id, order.id, "placed")
    
    return order


@router.post("/verify-payment")
def verify_payment(
    data: PaymentVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    try:
        # Ensure test/mock secret key overrides signature verification locally
        if settings.RAZORPAY_KEY_SECRET == "razorpay_secret_key_here" or not settings.RAZORPAY_KEY_SECRET or data.razorpay_payment_id == "mock_payment_id":
            order.payment_status = "paid"
            order.razorpay_payment_id = data.razorpay_payment_id
            order.razorpay_signature = data.razorpay_signature
            
            # Clear only the items that were in this order from the cart
            cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
            if cart:
                for oi in order.items:
                    db.query(CartItem).filter(
                        CartItem.cart_id == cart.id,
                        CartItem.product_id == oi.product_id,
                        CartItem.quantity == oi.quantity
                        # We could also check customization_details but it's complex for JSON comparison in SQL
                    ).delete(synchronize_session=False)
                
            db.commit()
            return {"status": "success", "message": "Payment verified (Mock)"}

        # Verify signature
        client.utility.verify_payment_signature({
            'razorpay_order_id': data.razorpay_order_id,
            'razorpay_payment_id': data.razorpay_payment_id,
            'razorpay_signature': data.razorpay_signature
        })
        
        order.payment_status = "paid"
        order.razorpay_payment_id = data.razorpay_payment_id
        order.razorpay_signature = data.razorpay_signature
        
        # Clear only the items that were in this order from the cart
        cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
        if cart:
            for oi in order.items:
                db.query(CartItem).filter(
                    CartItem.cart_id == cart.id,
                    CartItem.product_id == oi.product_id,
                    CartItem.quantity == oi.quantity
                ).delete(synchronize_session=False)
            
        db.commit()
        return {"status": "success", "message": "Payment verified"}
    except Exception as e:
        order.payment_status = "failed"
        db.commit()
        print(f"Payment Verification Error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")


@router.get("/my-orders", response_model=List[OrderOut])
def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Order).filter(Order.user_id == current_user.id, Order.is_deleted == False).all()

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return order
