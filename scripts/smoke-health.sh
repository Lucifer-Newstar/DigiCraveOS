#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

check() {
  local path="$1"
  local expected="$2"
  local body
  body="$(curl --fail --silent --show-error "$BASE_URL$path")"
  grep -q "$expected" <<<"$body"
  printf 'PASS %s\n' "$path"
}

check /api/health/live '"status":"ok"'
check /api/health/ready '"status":"ready"'
echo "Health smoke checks passed."
