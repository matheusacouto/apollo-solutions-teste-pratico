from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import products, categories, sales

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(sales.router)
