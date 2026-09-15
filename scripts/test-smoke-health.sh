#!/usr/bin/env bash
set -euo pipefail

PORT="${SMOKE_PORT:-39091}"
SMOKE_PORT="$PORT" node -e 'const attempts={"/api/health/live":0,"/api/health/ready":0}; require("http").createServer((req,res) => { res.setHeader("Content-Type", "application/json"); if (req.url === "/api/health/live" || req.url === "/api/health/ready") { attempts[req.url] += 1; if (attempts[req.url] === 1) { res.statusCode=503; return res.end(JSON.stringify({ error: "transient" })); } return res.end(JSON.stringify({ data: { status: req.url.endsWith("live") ? "ok" : "ready" } })); } res.statusCode=404; res.end(); }).listen(process.env.SMOKE_PORT)' &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
sleep 0.2
SMOKE_PORT="$PORT" BASE_URL="http://localhost:$PORT" HEALTH_RETRIES=2 HEALTH_RETRY_DELAY=0 ./scripts/smoke-health.sh
