"""create monthly sales

Revision ID: 2f6f5a9c2d1b
Revises: cc9b8b3b4f2a
Create Date: 2026-01-10 20:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2f6f5a9c2d1b"
down_revision: Union[str, None] = "cc9b8b3b4f2a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "monthly_sales",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("total_price", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("year", "month", name="uq_monthly_sales"),
    )
    op.create_index(op.f("ix_monthly_sales_id"), "monthly_sales", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_monthly_sales_id"), table_name="monthly_sales")
    op.drop_table("monthly_sales")
