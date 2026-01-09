from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from schemas import CategoryCreate, CategoryUpdate, ApiResponse

from services.categories_services import list_categories, create_category,edit_category

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/")
def get_categories(db: Session = Depends(get_db)):
    return list_categories(db)

@router.post("/", response_model=ApiResponse)
def create_category_endpoint(payload: CategoryCreate, db: Session = Depends(get_db)):
    category = create_category(db, payload)
    return ApiResponse(success=True, message="Categoria criada", data=category)

@router.put("/{category_id}")
def edit_category_endpoint(category_id: int, payload: CategoryUpdate, response_model=ApiResponse, db: Session = Depends(get_db)):
    return edit_category(db, category_id, payload)