"""add date to sales and drop year

Revision ID: cc9b8b3b4f2a
Revises: 7b2d3c4e9f1a
Create Date: 2026-01-10 20:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "cc9b8b3b4f2a"
down_revision: Union[str, None] = "7b2d3c4e9f1a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("sales", sa.Column("date", sa.Date(), nullable=True))
    op.drop_column("sales", "year")


def downgrade() -> None:
    op.add_column("sales", sa.Column("year", sa.Integer(), nullable=True))
    op.drop_column("sales", "date")
