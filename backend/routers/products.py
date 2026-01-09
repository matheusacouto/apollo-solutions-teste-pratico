from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from schemas import ProductCreate, ProductUpdate, ApiResponse

from services.products_services import list_products, create_product, edit_product


router = APIRouter(prefix="/products", tags=["products"])


@router.get("/")
def get_products(db: Session = Depends(get_db)):
    return list_products(db)

@router.post("/", response_model=ApiResponse)
def create_product_endpoint(payload: ProductCreate, db: Session = Depends(get_db)):
    product = create_product(db, payload)
    return ApiResponse(success=True, message="Produto criado", data=product)

@router.put("/{product_id}")
def edit_product_endpoint(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    return edit_product(db, product_id, payload)