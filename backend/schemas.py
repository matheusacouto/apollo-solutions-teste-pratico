from pydantic import BaseModel, ConfigDict
from typing import Generic, TypeVar, Optional

T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    message: Optional[str] = None
    data: Optional[T] = None

## Products

class ProductCreate(BaseModel):
    name: str
    description: str
    category_id: int
    price: float
    brand: str

class ProductUpdate(BaseModel):
    name: str
    description: str
    category_id: int
    price: float
    brand: str

class ProductOut(BaseModel):
    id: int
    name: str
    description: str
    category_id: int
    price: float | str
    brand: str

    model_config = ConfigDict(from_attributes=True)

## Categories

class CategoryCreate(BaseModel):
    name: str

class CategoryUpdate(BaseModel):
    name: str

class CategoryOut(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

## Sales

class SalesSummaryItem(BaseModel):
    month: int
    quantity: int
    total_price: float
    profit_variation: float


class MonthlySalesUpdate(BaseModel):
    quantity: int
    total_price: float


class MonthlySalesOut(BaseModel):
    year: int
    month: int
    quantity: int
    total_price: float

    model_config = ConfigDict(from_attributes=True)
