# 🤖 Restaurant POS — ML Service (`Restaurant_POS_ML`)

A lightweight machine-learning microservice for the DigiCraveOS Restaurant POS.
It reads **directly from the same MongoDB** the POS backend uses (the existing
`orders` / `customers` schema and existing data — no data duplication) and
exposes three capabilities:

| Capability | Endpoint | Model |
|---|---|---|
| 📈 **Sales forecasting** | `GET /forecast` | Ridge regression on trend + day-of-week seasonality |
| 🍛 **Dish demand prediction** | `GET /demand` | Per-dish weekday-seasonal + recent-trend estimator |
| 🧺 **Dish recommendations** | `POST /recommend` | Market-basket association (co-occurrence + lift) |
| ⭐ Most-ordered dishes | `GET /popular` | Line-item frequency count |
| ❤️ Health / DB status | `GET /health` | — |

The stack is intentionally **dependency-light** (FastAPI + PyMongo + NumPy).
All ML math is implemented directly on NumPy / the standard library so it
installs in seconds and runs in constrained environments — no pandas or
scikit-learn build steps required.

---

## 🏗️ How it connects to the website

```
React frontend  ──/api/ml/*──►  Node/Express backend  ──HTTP──►  this ML service  ──►  MongoDB
 (AI Insights tab)              (proxy, auth-protected)          (FastAPI, port 8100)
```

* The Node backend adds `/api/ml/*` routes (`pos-backend/routes/mlRoute.js` +
  `controllers/mlController.js`) that require an authenticated user and proxy
  to this service using the `ML_SERVICE_URL` env var.
* The frontend calls those routes from a new **“AI Insights”** tab on the
  **Admin Dashboard** (`pos-frontend/src/components/dashboard/AiInsights.jsx`).

---

## 🚀 Quick start

```bash
cd Restaurant_POS_ML

# 1. Create a virtualenv & install deps (all prebuilt wheels)
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# 2. Configure — point at the SAME database the POS backend uses
cp .env.example .env      # edit MONGODB_URI if needed

# 3. (Optional) seed realistic demo data so the models have something to learn
.venv/bin/python seed_data.py --days 90

# 4. Run the service
.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8100
```

Then in the POS backend `.env` set:

```
ML_SERVICE_URL=http://localhost:8100
```

and restart the backend. The **Dashboard → AI Insights** tab will light up.

---

## 🌱 Seeding demo data

The seeder writes documents that match the exact `orders` schema the Node
backend produces, embedding learnable patterns (weekend peaks, an upward
revenue trend, and dish co-occurrence like *Butter Chicken → Butter Naan +
Gulab Jamun*).

```bash
python seed_data.py                 # ~90 days of synthetic orders
python seed_data.py --days 120      # custom span
python seed_data.py --clear         # remove only previously-seeded orders
python seed_data.py --wipe-all      # remove ALL orders + customers (careful!)
```

Seeded orders are tagged with `_source: "ml-seed"` so `--clear` removes only
them and leaves any real orders untouched.

> Once real orders exist in the DB, the models train on them automatically —
> no seeding required. The service always reflects live data at request time.

---

## 📡 API reference

```
GET  /health
GET  /forecast?horizon_days=7
GET  /demand?target_date=YYYY-MM-DD&top=12
GET  /popular?limit=10
POST /recommend        { "items": ["Butter Chicken"], "limit": 5 }
GET  /recommend?items=Butter%20Chicken,Palak%20Paneer&limit=5
```

Interactive docs are available at `http://localhost:8100/docs` (FastAPI/Swagger).

---

## 🧠 Model notes

* **Forecast** — aggregates orders into a daily revenue/order series, fits a
  Ridge regression (closed-form normal equations) on `[trend, day-of-week
  one-hot, weekend]`. Falls back to a simple average when there are fewer than
  5 days of history. Reports an in-sample R² as a trust signal.
* **Demand** — for each dish builds a daily quantity series and blends the
  same-weekday average (seasonality, 65%) with the last-14-day average (trend,
  35%). Dishes with little history fall back to their overall average.
* **Recommendations** — builds item co-occurrence counts across all baskets and
  scores candidates by `lift × confidence` against the current cart, with a
  small popularity tie-break. Empty carts fall back to popularity.
