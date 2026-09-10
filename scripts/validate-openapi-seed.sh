#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SPEC="$ROOT/docs/phase-4/openapi.yaml"
for required in '/api/health/live:' '/api/health/ready:' '/api/inventory:' '/api/order:' '/api/reports/admin-activity:' '/api/reports/export/orders.csv:' 'securitySchemes:'; do
  grep -q "$required" "$SPEC"
done
grep -q 'openapi: 3.0.3' "$SPEC"
echo "OpenAPI contract seed validation passed."
