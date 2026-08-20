#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MONGO_URI="${TEST_MONGODB_URI:-mongodb://127.0.0.1:27017/pos-db-test}"

printf '\n== Backend integration tests ==\n'
(cd "$ROOT/tests/backend" && TEST_MONGODB_URI="$MONGO_URI" npm test -- --runInBand)

printf '\n== ML tests ==\n'
(cd "$ROOT" && Restaurant_POS_ML/.venv/bin/python -m pytest tests/ml -q)

printf '\n== Frontend lint ==\n'
(cd "$ROOT/Restaurant_POS_System/pos-frontend" && npm run lint)

printf '\n== Frontend production build ==\n'
(cd "$ROOT/Restaurant_POS_System/pos-frontend" && npm run build)

printf '\nAll verification commands passed.\n'
