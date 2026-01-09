from models import Category

def list_categories(db):
    return db.query(Category).all()

def create_category(db, data):
    category = Category(name=data.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

def edit_category(db, category_id, data):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return None
    
    category.name = data.name

    db.commit()
    db.refresh(category)
    return category