#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
grep -q 'class ErrorBoundary' "$ROOT/Restaurant_POS_System/pos-frontend/src/components/shared/ErrorBoundary.jsx"
grep -q 'ErrorBoundary' "$ROOT/Restaurant_POS_System/pos-frontend/src/main.jsx"
echo "Frontend error boundary smoke check passed."
