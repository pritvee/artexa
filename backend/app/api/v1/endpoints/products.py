from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.api.v1.endpoints.auth import get_current_user, get_current_active_admin
from app.models.models import Product, Category, User, UploadedPhoto
from datetime import datetime

from app.schemas.product import ProductOut, ProductCreate, CategoryOut, ProductListOut
import os
import shutil
from app.core.config import settings

router = APIRouter()

@router.get("/", response_model=ProductListOut)
def get_products(
    category_id: Optional[int] = None,
    on_home: Optional[bool] = None,
    on_shop: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if on_home is not None:
        query = query.filter(Product.is_on_home == on_home)
    if on_shop is not None:
        query = query.filter(Product.is_on_shop == on_shop)
    if search:
        query = query.filter(Product.name.contains(search))
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    print(f"DEBUG: Found {len(items)} products")
    for item in items:
        print(f"DEBUG: Product {item.id}: {item.name}, customization: {item.has_customization}")
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/upload-image")
def upload_image(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_active_admin)
):
    import uuid
    if not os.path.exists(settings.UPLOAD_DIR):
        os.makedirs(settings.UPLOAD_DIR)
    
    ext = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"image_url": f"/uploads/{unique_filename}"}

# User upload for customization
@router.post("/upload-customization", response_model=dict)
def upload_customization_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, "user_uploads")
    if not os.path.exists(user_upload_dir):
        os.makedirs(user_upload_dir)
    
    # Simple unique filename
    filename = f"{current_user.id}_{int(datetime.now().timestamp())}_{file.filename}"
    file_path = os.path.join(user_upload_dir, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    db_photo = UploadedPhoto(
        user_id=current_user.id,
        file_path=f"/uploads/user_uploads/{filename}"
    )
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    
    return {"id": db_photo.id, "image_url": db_photo.file_path}

