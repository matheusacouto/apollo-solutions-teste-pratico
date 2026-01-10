import csv
import io

from fastapi import APIRouter, Depends, File, UploadFile, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from db import get_db
from models import Sale
from schemas import ApiResponse, MonthlySalesOut, MonthlySalesUpdate, SalesSummaryItem
from services.sales_services import (
    import_sales_from_csv,
    sales_summary,
    sales_years,
    upsert_monthly_sales,
)

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("/summary", response_model=list[SalesSummaryItem])
def get_sales_summary(
    year: int | None = Query(default=None), db: Session = Depends(get_db)
):
    return sales_summary(db, year)


@router.get("/years", response_model=list[int])
def get_sales_years(db: Session = Depends(get_db)):
    return sales_years(db)


@router.post("/upload", response_model=ApiResponse)
async def upload_sales_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    result = import_sales_from_csv(db, contents)
    return ApiResponse(success=True, message="Importacao concluida", data=result)


@router.get("/csv")
def export_sales_csv(
    year: int | None = Query(default=None), db: Session = Depends(get_db)
):
    query = db.query(Sale)
    if year:
        query = query.filter(func.extract("year", Sale.date) == year)
    rows = query.order_by(Sale.id).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "product_id", "quantity", "total_price", "date"])
    for row in rows:
        writer.writerow(
            [
                row.id,
                row.product_id,
                row.quantity,
                f"{row.total_price / 100:.2f}",
                row.date.isoformat() if row.date else "",
            ]
        )
    output.seek(0)
    headers = {"Content-Disposition": "attachment; filename=sales.csv"}
    return StreamingResponse(output, media_type="text/csv", headers=headers)


@router.put("/override/{year}/{month}", response_model=MonthlySalesOut)
def upsert_sales_override(
    year: int,
    month: int,
    payload: MonthlySalesUpdate,
    db: Session = Depends(get_db),
):
    return upsert_monthly_sales(db, year, month, payload.quantity, payload.total_price)
