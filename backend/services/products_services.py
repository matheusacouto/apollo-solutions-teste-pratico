import csv
import io

from sqlalchemy.exc import IntegrityError

from models import Product


def list_products(db):
    return db.query(Product).all()

def create_product(db, data):
    product = Product(
        name=data.name, 
        description=data.description, 
        category_id=data.category_id, 
        price=data.price, 
        brand=data.brand,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

def edit_product(db, product_id, data):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return None
    
    product.name = data.name
    product.description = data.description
    product.category_id = data.category_id
    product.price = data.price
    product.brand = data.brand

    db.commit()
    db.refresh(product)
    return product


def delete_product(db, product_id):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return None

    db.delete(product)
    db.commit()
    return product


def import_products_from_csv(db, file_contents: bytes):
    decoded = file_contents.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))
    errors = []
    products = []

    for index, row in enumerate(reader, start=1):
        try:
            name = (row.get("name") or "").strip()
            description = (row.get("description") or "").strip()
            brand = (row.get("brand") or "").strip()
            category_id = int(row.get("category_id") or 0)
            price = float(row.get("price") or 0)

            if not name or not description or not brand or not category_id:
                errors.append({"row": index, "error": "Campos obrigatorios ausentes"})
                continue

            products.append(
                Product(
                    name=name,
                    description=description,
                    category_id=category_id,
                    price=price,
                    brand=brand,
                )
            )
        except (ValueError, TypeError) as exc:
            errors.append({"row": index, "error": f"Dados invalidos: {exc}"})

    if errors:
        return {"created": 0, "skipped": 0, "errors": errors}

    try:
        db.add_all(products)
        db.commit()
        created = len(products)
    except IntegrityError as exc:
        db.rollback()
        return {
            "created": 0,
            "skipped": 0,
            "errors": [{"row": 0, "error": f"Duplicado ou violacao: {exc.orig}"}],
        }

    return {"created": created, "skipped": 0, "errors": []}
