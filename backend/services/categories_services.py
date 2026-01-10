import csv
import io

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

from models import Category

def list_categories(db):
    return db.query(Category).all()

def create_category(db, data):
    name = data.name.strip()
    exists = (
        db.query(Category)
        .filter(func.lower(Category.name) == name.lower())
        .first()
    )
    if exists:
        return None

    category = Category(name=name)
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


def import_categories_from_csv(db, file_contents: bytes):
    decoded = file_contents.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))
    created = 0
    skipped = 0
    errors = []

    for index, row in enumerate(reader, start=1):
        try:
            name = (row.get("name") or "").strip()
            if not name:
                skipped += 1
                errors.append({"row": index, "error": "Nome vazio"})
                continue

            exists = (
                db.query(Category)
                .filter(func.lower(Category.name) == name.lower())
                .first()
            )
            if exists:
                skipped += 1
                errors.append({"row": index, "error": "Categoria duplicada"})
                continue

            category = Category(name=name)
            db.add(category)
            db.commit()
            db.refresh(category)
            created += 1
        except (ValueError, TypeError) as exc:
            db.rollback()
            skipped += 1
            errors.append({"row": index, "error": f"Dados invalidos: {exc}"})
        except IntegrityError as exc:
            db.rollback()
            skipped += 1
            errors.append({"row": index, "error": f"Duplicado ou violacao: {exc.orig}"})

    return {"created": created, "skipped": skipped, "errors": errors}
