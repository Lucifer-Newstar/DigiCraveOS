# 🧪 DigiCraveOS — Test Suite

Automated tests for the POS API and the ML service.

| Suite | Stack | Location | What it covers |
|---|---|---|---|
| Backend API | **Jest + Supertest** | `tests/backend/` | Auth, order lifecycle & state machine, hold/resume/split/merge, menu CRUD, payment verification, metrics & payments endpoints |
| ML service | **pytest + FastAPI TestClient** | `tests/ml/` | health, forecast, demand, popular, recommend (association + popularity fallback) |

## Prerequisites
- **MongoDB** running on `localhost:27017` (tests use isolated databases:
  `pos-db-test` for the API, `pos-db-mltest` for ML, dropped after each run).
- Backend deps installed (`Restaurant_POS_System/pos-backend/node_modules`).
- ML virtualenv at `Restaurant_POS_ML/.venv` with `pytest` + `httpx`.

## Run everything
```bash
bash tests/run-all-tests.sh
```

## Run individually
```bash
# Backend API
cd tests/backend && npm install && npx jest --runInBand --forceExit

# ML service
Restaurant_POS_ML/.venv/bin/python -m pytest tests/ml -v
```

## Notes
- The Express `app` is exported from `app.js` and only starts a listener when
  run directly (`require.main === module`), so Supertest mounts it in-process.
- Tests connect using the **backend's** mongoose instance so models and the
  test connection share one client.
- Latest run: **23 backend tests + 7 ML tests = 30 passing.**
