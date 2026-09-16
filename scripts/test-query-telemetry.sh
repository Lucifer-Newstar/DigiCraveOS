#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAIN="$ROOT/Restaurant_POS_System/pos-frontend/src/main.jsx"
MODULE="$ROOT/Restaurant_POS_System/pos-frontend/src/observability/queryTelemetry.js"
grep -q 'new QueryCache' "$MAIN"
grep -q 'reportQueryError' "$MAIN"
grep -q 'pos:query-error' "$MODULE"
grep -q 'query_error' "$MODULE"
printf 'Frontend query telemetry smoke check passed.\n'
