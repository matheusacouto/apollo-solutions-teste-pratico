#!/usr/bin/env sh
set -e

VENV_PATH="/app/.venv"
REQ_FILE="/app/requirements.txt"
STAMP_FILE="$VENV_PATH/.requirements_installed"

if [ ! -d "$VENV_PATH" ]; then
  python -m venv --upgrade-deps "$VENV_PATH"
fi

if [ ! -x "$VENV_PATH/bin/pip" ]; then
  rm -rf "$VENV_PATH"
  python -m venv --upgrade-deps "$VENV_PATH"
  "$VENV_PATH/bin/python" -m ensurepip --upgrade
fi

if [ -f "$REQ_FILE" ] && { [ ! -f "$STAMP_FILE" ] || [ "$REQ_FILE" -nt "$STAMP_FILE" ]; }; then
  "$VENV_PATH/bin/pip" install --no-cache-dir -r "$REQ_FILE"
  touch "$STAMP_FILE"
fi

export VIRTUAL_ENV="$VENV_PATH"
export PATH="$VENV_PATH/bin:$PATH"

if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "Waiting for database..."
    "$VENV_PATH/bin/python" - <<'PY'
import os
import time
from sqlalchemy import create_engine

url = os.environ.get("DATABASE_URL")
engine = create_engine(url, pool_pre_ping=True)
deadline = time.time() + 30

while True:
    try:
        with engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
        break
    except Exception:
        if time.time() > deadline:
            raise
        time.sleep(1)
PY
    "$VENV_PATH/bin/python" -m alembic upgrade head
  else
    echo "DATABASE_URL not set; skipping migrations."
  fi
fi

exec "$@"
