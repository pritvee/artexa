from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Cart, CartItem, Product, User
from app.schemas.cart import CartOut, CartItemCreate
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=CartOut)
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
    return cart

@router.post("/items/")
def add_to_cart(
    item_in: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
    
    new_item = CartItem(
        cart_id=cart.id,
        product_id=item_in.product_id,
        quantity=item_in.quantity,
        customization_details=item_in.customization_details,
        preview_image_url=item_in.preview_image_url,
        uploaded_photo_id=item_in.uploaded_photo_id
    )
    db.add(new_item)
    db.commit()
    return {"message": "Item added to cart"}
@router.patch("/items/{item_id}/")
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

@router.delete("/items/{item_id}/")
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
