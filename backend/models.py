from sqlalchemy import Column, Integer, String, ForeignKey, Date, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(120), nullable=False)
    name = Column(String(100), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    price = Column(String(120), nullable=False)
    brand = Column(String(120), nullable=False)


    category = relationship("Category", back_populates="products")
    sales = relationship("Sale", back_populates="products")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    month = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Integer, nullable=False)
    date = Column(Date, nullable=True)

    products = relationship("Product", back_populates="sales")


class MonthlySales(Base):
    __tablename__ = "monthly_sales"
    __table_args__ = (UniqueConstraint("year", "month", name="uq_monthly_sales"),)

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Integer, nullable=False)
