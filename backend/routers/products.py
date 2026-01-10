import csv
import io

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from db import get_db
from schemas import ProductCreate, ProductUpdate, ProductOut, ApiResponse

from services.products_services import (
    list_products,
    create_product,
    edit_product,
    delete_product,
    import_products_from_csv,
)


router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=list[ProductOut])
def get_products(db: Session = Depends(get_db)):
    return list_products(db)

@router.post("/", response_model=ApiResponse[ProductOut])
def create_product_endpoint(payload: ProductCreate, db: Session = Depends(get_db)):
    product = create_product(db, payload)
    return ApiResponse(success=True, message="Produto criado", data=product)

@router.put("/{product_id}", response_model=ProductOut)
def edit_product_endpoint(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    return edit_product(db, product_id, payload)


@router.delete("/{product_id}", response_model=ApiResponse[ProductOut])
def delete_product_endpoint(product_id: int, db: Session = Depends(get_db)):
    product = delete_product(db, product_id)
    if not product:
        return ApiResponse(success=False, message="Produto nao encontrado")
    return ApiResponse(success=True, message="Produto removido", data=product)


@router.post("/upload", response_model=ApiResponse)
async def upload_products_csv(
    file: UploadFile = File(...), db: Session = Depends(get_db)
):
    contents = await file.read()
    result = import_products_from_csv(db, contents)
    return ApiResponse(success=True, message="Importacao concluida", data=result)


@router.get("/csv")
def export_products_csv(db: Session = Depends(get_db)):
    products = list_products(db)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "name", "description", "price", "category_id", "brand"])
    for product in products:
        writer.writerow(
            [
                product.id,
                product.name,
                product.description,
                product.price,
                product.category_id,
                product.brand,
            ]
        )
    output.seek(0)
    headers = {"Content-Disposition": "attachment; filename=products.csv"}
    return StreamingResponse(output, media_type="text/csv", headers=headers)
