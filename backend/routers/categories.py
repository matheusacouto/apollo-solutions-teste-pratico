from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
from db import get_db
from schemas import CategoryCreate, CategoryUpdate, CategoryOut, ApiResponse

from services.categories_services import (
    list_categories,
    create_category,
    edit_category,
    import_categories_from_csv,
)

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=list[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return list_categories(db)

@router.post("/", response_model=ApiResponse[CategoryOut])
def create_category_endpoint(payload: CategoryCreate, db: Session = Depends(get_db)):
    category = create_category(db, payload)
    if not category:
        return ApiResponse(success=False, message="Categoria ja existe")
    return ApiResponse(success=True, message="Categoria criada", data=category)

@router.put("/{category_id}")
def edit_category_endpoint(category_id: int, payload: CategoryUpdate, response_model=ApiResponse, db: Session = Depends(get_db)):
    return edit_category(db, category_id, payload)


@router.post("/upload", response_model=ApiResponse)
async def upload_categories_csv(
    file: UploadFile = File(...), db: Session = Depends(get_db)
):
    contents = await file.read()
    result = import_categories_from_csv(db, contents)
    return ApiResponse(success=True, message="Importacao concluida", data=result)
