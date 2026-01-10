import csv
import io
from datetime import datetime

from sqlalchemy import Integer, func
from sqlalchemy.exc import IntegrityError

from models import MonthlySales, Sale


def sales_summary(db, year=None):
    overrides = {}
    if year:
        override_rows = (
            db.query(MonthlySales)
            .filter(MonthlySales.year == year)
            .all()
        )
        overrides = {item.month: item for item in override_rows}

    query = db.query(
        Sale.month,
        func.sum(Sale.quantity).label("quantity"),
        func.sum(Sale.total_price).label("total_price"),
    )
    if year:
        query = query.filter(func.extract("year", Sale.date) == year)
    rows = query.group_by(Sale.month).order_by(Sale.month).all()

    results = []
    for row in rows:
        override = overrides.get(row.month)
        if override:
            results.append(
                {
                    "month": override.month,
                    "quantity": override.quantity,
                    "total_price": float(override.total_price) / 100,
                }
            )
        else:
            results.append(
                {
                    "month": row.month,
                    "quantity": row.quantity or 0,
                    "total_price": float(row.total_price or 0) / 100,
                }
            )

    if year:
        row_months = {row.month for row in rows}
        for override in override_rows:
            if override.month not in row_months:
                results.append(
                    {
                        "month": override.month,
                        "quantity": override.quantity,
                        "total_price": float(override.total_price) / 100,
                    }
                )

    results = sorted(results, key=lambda item: item["month"])
    previous_total = None
    for item in results:
        if previous_total is None:
            item["profit_variation"] = 0.0
        else:
            item["profit_variation"] = item["total_price"] - previous_total
        previous_total = item["total_price"]

    return results


def import_sales_from_csv(db, file_contents: bytes):
    decoded = file_contents.decode("utf-8")
    raw_lines = io.StringIO(decoded)
    sniff_reader = csv.reader(raw_lines)
    header = next(sniff_reader, None)
    raw_lines.seek(0)

    has_header = header and "product_id" in header
    reader = (
        csv.DictReader(raw_lines)
        if has_header
        else csv.reader(raw_lines)
    )
    created = 0
    skipped = 0
    errors = []

    for index, row in enumerate(reader, start=1):
        try:
            if has_header:
                product_id = int(row.get("product_id") or 0)
                quantity = int(row.get("quantity") or 0)
                total_price_raw = float(row.get("total_price") or 0)
                date_raw = (row.get("date") or "").strip()
            else:
                if len(row) < 5:
                    skipped += 1
                    errors.append({"row": index, "error": "Linha incompleta"})
                    continue
                product_id = int(row[1] or 0)
                quantity = int(row[2] or 0)
                total_price_raw = float(row[3] or 0)
                date_raw = (row[4] or "").strip()
            if not (product_id and quantity and date_raw):
                skipped += 1
                errors.append({"row": index, "error": "Campos obrigatorios ausentes"})
                continue

            date = datetime.strptime(date_raw, "%Y-%m-%d").date()
            month = date.month
            total_price_cents = int(round(total_price_raw * 100))

            sale = Sale(
                product_id=product_id,
                month=month,
                quantity=quantity,
                total_price=total_price_cents,
                date=date,
            )
            db.add(sale)
            db.commit()
            db.refresh(sale)
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


def sales_years(db):
    year_value = func.extract("year", Sale.date).cast(Integer).label("year")
    sales_years = (
        db.query(year_value)
        .filter(Sale.date.isnot(None))
        .distinct()
        .all()
    )
    override_years = db.query(MonthlySales.year).distinct().all()
    years = {row.year for row in sales_years if row.year is not None}
    years.update({row.year for row in override_years if row.year is not None})
    return sorted(years)


def upsert_monthly_sales(db, year: int, month: int, quantity: int, total_price: float):
    entry = (
        db.query(MonthlySales)
        .filter(MonthlySales.year == year, MonthlySales.month == month)
        .first()
    )
    total_price_cents = int(round(total_price * 100))
    if entry:
        entry.quantity = quantity
        entry.total_price = total_price_cents
        db.commit()
        db.refresh(entry)
        return entry

    entry = MonthlySales(
        year=year,
        month=month,
        quantity=quantity,
        total_price=total_price_cents,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
