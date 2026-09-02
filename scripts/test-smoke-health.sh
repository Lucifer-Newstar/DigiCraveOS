#!/usr/bin/env bash
set -euo pipefail

PORT="${SMOKE_PORT:-39091}"
SMOKE_PORT="$PORT" node -e 'require("http").createServer((req,res) => { res.setHeader("Content-Type", "application/json"); if (req.url === "/api/health/live") return res.end(JSON.stringify({ data: { status: "ok" } })); if (req.url === "/api/health/ready") return res.end(JSON.stringify({ data: { status: "ready" } })); res.statusCode=404; res.end(); }).listen(process.env.SMOKE_PORT)' &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
sleep 0.2
SMOKE_PORT="$PORT" BASE_URL="http://localhost:$PORT" ./scripts/smoke-health.sh
