from pydantic import BaseModel
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

## Categories

class CategoryCreate(BaseModel):
    name: str

class CategoryUpdate(BaseModel):
    name: str