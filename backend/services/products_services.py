from models import Product


def list_products(db):
    return db.query(Product).all()

def create_product(db, data):
    product = Product(
        name=data.name, 
        descriptin=data.description, 
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