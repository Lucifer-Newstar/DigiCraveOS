#!/usr/bin/env bash
# Convenience runner for the Restaurant POS ML service.
# Creates a venv if missing, installs deps, and starts the API.
set -e
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  echo "Creating virtualenv..."
  python3 -m venv .venv
  .venv/bin/pip install --upgrade pip
  .venv/bin/pip install -r requirements.txt
fi

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit MONGODB_URI if needed."
fi

PORT="${ML_PORT:-8100}"
echo "Starting ML service on port ${PORT}..."
exec .venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT}"
