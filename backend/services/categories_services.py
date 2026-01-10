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
    fieldnames = [name.strip() for name in (reader.fieldnames or [])]
    allowed_fields = {"id", "name"}
    if not fieldnames or "name" not in fieldnames or any(
        field not in allowed_fields for field in fieldnames
    ):
        return {
            "created": 0,
            "skipped": 0,
            "errors": [
                {"row": 0, "error": "CSV invalido: colunas esperadas id,name"}
            ],
        }
    errors = []
    names_seen = set()
    categories = []

    for index, row in enumerate(reader, start=1):
        try:
            name = (row.get("name") or "").strip()
            if not name:
                errors.append({"row": index, "error": "Nome vazio"})
                continue

            name_key = name.lower()
            if name_key in names_seen:
                errors.append({"row": index, "error": "Nome duplicado no CSV"})
                continue
            names_seen.add(name_key)

            exists = (
                db.query(Category)
                .filter(func.lower(Category.name) == name.lower())
                .first()
            )
            if exists:
                errors.append({"row": index, "error": "Categoria duplicada"})
                continue

            categories.append(Category(name=name))
        except (ValueError, TypeError) as exc:
            errors.append({"row": index, "error": f"Dados invalidos: {exc}"})

    if errors:
        return {"created": 0, "skipped": 0, "errors": errors}

    try:
        db.add_all(categories)
        db.commit()
        created = len(categories)
    except IntegrityError as exc:
        db.rollback()
        return {
            "created": 0,
            "skipped": 0,
            "errors": [{"row": 0, "error": f"Duplicado ou violacao: {exc.orig}"}],
        }

    return {"created": created, "skipped": 0, "errors": []}
