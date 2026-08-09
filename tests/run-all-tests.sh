#!/usr/bin/env bash
# Run the full DigiCraveOS test suite: backend (Jest+Supertest) + ML (pytest).
# Requires a running MongoDB on localhost:27017 (tests use isolated *-test DBs).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "════════════════════════════════════════════"
echo " 1/2  Backend API tests (Jest + Supertest)"
echo "════════════════════════════════════════════"
cd "$ROOT/tests/backend"
[ -d node_modules ] || npm install
npx jest --runInBand --forceExit

echo ""
echo "════════════════════════════════════════════"
echo " 2/2  ML service tests (pytest)"
echo "════════════════════════════════════════════"
cd "$ROOT"
PY="$ROOT/Restaurant_POS_ML/.venv/bin/python"
[ -x "$PY" ] || PY="python3"
"$PY" -m pytest tests/ml -v

echo ""
echo "✅ All test suites completed."
