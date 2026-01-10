"""add year to sales

Revision ID: 7b2d3c4e9f1a
Revises: f019af109a83
Create Date: 2026-01-10 20:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7b2d3c4e9f1a"
down_revision: Union[str, None] = "f019af109a83"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("sales", sa.Column("year", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("sales", "year")
