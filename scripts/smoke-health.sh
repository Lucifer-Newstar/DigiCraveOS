#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
HEALTH_RETRIES="${HEALTH_RETRIES:-3}"
HEALTH_RETRY_DELAY="${HEALTH_RETRY_DELAY:-1}"

if ! [[ "$HEALTH_RETRIES" =~ ^[0-9]+$ ]] || ! [[ "$HEALTH_RETRY_DELAY" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
  echo "HEALTH_RETRIES must be an integer and HEALTH_RETRY_DELAY must be a non-negative number" >&2
  exit 2
fi

check() {
  local path="$1"
  local expected="$2"
  local body
  body="$(curl --fail --silent --show-error --retry "$HEALTH_RETRIES" --retry-delay "$HEALTH_RETRY_DELAY" --retry-connrefused "$BASE_URL$path")"
  grep -q "$expected" <<<"$body"
  printf 'PASS %s\n' "$path"
}

check /api/health/live '"status":"ok"'
check /api/health/ready '"status":"ready"'
echo "Health smoke checks passed."
