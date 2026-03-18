from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, cast
from app.db.session import get_db
from app.models.models import Cart, CartItem, Product, User
from app.schemas.cart import CartOut, CartItemCreate
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

def _get_or_create_cart(db: Session, user_id: int) -> Cart:
    """Helper to fetch or initialize a cart for a user robustly."""
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        try:
            db.commit()
            db.refresh(cart)
        except Exception:
            db.rollback()
            # If another request created it in the meantime, fetch it
            cart = db.query(Cart).filter(Cart.user_id == user_id).first()
            if not cart:
                raise HTTPException(status_code=500, detail="Could not initialize user cart")
    return cart

@router.get("", response_model=CartOut, responses={500: {"description": "Internal Server Error"}})
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return _get_or_create_cart(db, current_user.id)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"CRITICAL: Failed to get/create cart for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Cart service is currently unavailable")

@router.post("/items", response_model=dict, responses={500: {"description": "Internal Server Error"}})
def add_to_cart(
    item_in: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # 1. Get or Create Cart
        cart = _get_or_create_cart(db, current_user.id)

        # 2. Check for existing item with same customization
        potential_items = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == item_in.product_id
        ).all()

        existing_item = None
        for item in potential_items:
            # We compare in Python to avoid "operator does not exist: json = json"
            if item.customization_details == item_in.customization_details:
                existing_item = item
                break

        if existing_item is not None:
            # Add to existing item
            # Using cast to satisfy static analysis as existing_item is guaranteed non-None here
            item_to_update = cast(CartItem, existing_item)
            qty = item_in.quantity if item_in.quantity is not None else 1
            item_to_update.quantity += qty
            
            # Update preview/photo if provided
            if item_in.preview_image_url:
                item_to_update.preview_image_url = item_in.preview_image_url
            if item_in.uploaded_photo_id:
                item_to_update.uploaded_photo_id = item_in.uploaded_photo_id
        else:
            # Create new item
            new_item = CartItem(
                cart_id=cart.id,
                product_id=item_in.product_id,
                quantity=item_in.quantity if item_in.quantity is not None else 1,
                customization_details=item_in.customization_details,
                preview_image_url=item_in.preview_image_url,
                uploaded_photo_id=item_in.uploaded_photo_id
            )
            db.add(new_item)
        
        db.commit()
        return {"message": "Success", "status": "item_added"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"CRITICAL: add_to_cart failed for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add item to cart: {str(e)}")
@router.patch("/items/{item_id}", response_model=dict)
def update_cart_item(
    item_id: int,
    item_update: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(CartItem).join(Cart).filter(
        CartItem.id == item_id,
        Cart.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if "quantity" in item_update:
        item.quantity = item_update["quantity"]
    if "customization_details" in item_update:
        item.customization_details = item_update["customization_details"]
    if "preview_image_url" in item_update:
        item.preview_image_url = item_update["preview_image_url"]
    if "uploaded_photo_id" in item_update:
        item.uploaded_photo_id = item_update["uploaded_photo_id"]
        
    db.commit()
    return {"message": "Cart updated"}

@router.delete("/items/{item_id}", response_model=dict)
def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(CartItem).join(Cart).filter(
        CartItem.id == item_id,
        Cart.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(item)
    db.commit()
    return {"message": "Item removed"}

@router.delete("", response_model=dict)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear all items from the user's cart."""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete(synchronize_session=False)
        db.commit()
    return {"message": "Cart cleared"}
