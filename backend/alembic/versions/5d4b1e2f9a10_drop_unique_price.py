"""drop unique constraint on product price

Revision ID: 5d4b1e2f9a10
Revises: 2f6f5a9c2d1b
Create Date: 2026-01-10 21:10:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "5d4b1e2f9a10"
down_revision: Union[str, None] = "2f6f5a9c2d1b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("products_price_key", "products", type_="unique")


def downgrade() -> None:
    op.create_unique_constraint("products_price_key", "products", ["price"])
