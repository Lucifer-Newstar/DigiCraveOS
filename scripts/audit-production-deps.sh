#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/Restaurant_POS_System/pos-frontend"
echo "Running production dependency audit..."
npm audit --omit=dev
