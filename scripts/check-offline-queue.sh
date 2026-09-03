#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
QUEUE="$ROOT/Restaurant_POS_System/pos-frontend/src/utils/offlineQueue.js"
HEADER="$ROOT/Restaurant_POS_System/pos-frontend/src/components/shared/Header.jsx"
grep -q 'getQueueStats' "$QUEUE"
grep -q 'digicrave:queue-changed' "$QUEUE"
grep -q 'Offline queue' "$HEADER"
echo "Offline queue observability smoke check passed."
