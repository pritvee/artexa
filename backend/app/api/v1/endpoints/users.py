from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.models import User, Address, Review, Product
from app.schemas.user import UserOut, UserBase, AddressCreate, AddressOut

router = APIRouter()


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserOut)
def update_me(
    user_update: UserBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.name = user_update.name
    current_user.phone = user_update.phone
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me/addresses", response_model=list[AddressOut])
def get_my_addresses(current_user: User = Depends(get_current_user)):
    try:
        if not current_user.addresses:
            return []
        return current_user.addresses
    except Exception as e:
        print(f"ERROR fetching addresses for user {current_user.id}: {str(e)}")
        return []

@router.post("/me/addresses", response_model=AddressOut)
def add_address(
    address_in: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If this is the first address, make it default
    is_default = address_in.is_default
    if not current_user.addresses:
        is_default = True
    
    # If this is set as default, unset others
    if is_default:
        for addr in current_user.addresses:
            addr.is_default = False
            
    db_address = Address(
        **address_in.dict(exclude={'is_default'}),
        user_id=current_user.id,
        is_default=is_default
    )
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    return db_address

@router.delete("/me/addresses/{address_id}")
def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(address)
    db.commit()
    return {"message": "Address deleted"}

@router.post("/products/{product_id}/reviews")
def add_review(
    product_id: int,
    rating: int,
    comment: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    review = Review(
        product_id=product_id,
        user_id=current_user.id,
        rating=rating,
        comment=comment
    )
    db.add(review)
    db.commit()
    return {"message": "Review added"}

