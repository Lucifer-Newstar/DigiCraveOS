# 🚀 DigiCraveOS — Deployment & CI/CD

DigiCraveOS has **three runtimes + a database**, each with different hosting
needs. Vercel is ideal for the frontend but cannot run a long-lived Node/Python
server or a database, so those are hosted on Render (or Railway) + MongoDB Atlas.

```
 ┌──────────────┐      ┌──────────────────┐      ┌─────────────────────┐
 │  Vercel      │ ───► │  Render/Railway  │ ───► │  Render/Railway     │
 │  pos-frontend│ API  │  pos-backend     │ /ml  │  Restaurant_POS_ML  │
 └──────────────┘      └────────┬─────────┘      └──────────┬──────────┘
                                 │                            │
                                 └──────────► MongoDB Atlas ◄─┘
```

| Piece | Host | Config file |
|-------|------|-------------|
| **pos-frontend** (React/Vite) | **Vercel** | `vercel.json`, `.vercelignore` |
| **pos-backend** (Node/Express) | **Render** or **Railway** | `render.yaml`, `pos-backend/Dockerfile`, `pos-backend/railway.json` |
| **Restaurant_POS_ML** (FastAPI) | **Render** or **Railway** | `render.yaml`, `Restaurant_POS_ML/Dockerfile`, `railway.json` |
| **MongoDB** | **MongoDB Atlas** (free tier) | — |

---

## 1. Database — MongoDB Atlas

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. Add a database user and allow network access (`0.0.0.0/0` for cloud hosts).
3. Copy the connection string, e.g.
   `mongodb+srv://user:pass@cluster.mongodb.net/pos-db`.
   This is your **`MONGODB_URI`** (used by both the backend and the ML service).

---

## 2. Backend + ML — Render (recommended)

The repo ships a **Render Blueprint** (`render.yaml`) that defines both services.

1. On Render: **New + → Blueprint** → select this repo.
2. Render reads `render.yaml` and creates `digicrave-pos-api` and `digicrave-ml`.
3. Fill in the secret env vars (marked `sync: false`):

   **digicrave-pos-api**
   | Var | Value |
   |-----|-------|
   | `MONGODB_URI` | your Atlas URI |
   | `JWT_SECRET` | a long random string |
   | `CORS_ORIGIN` | your Vercel URL, e.g. `https://digicraveos.vercel.app` |
   | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | from Razorpay |
   | `ML_SERVICE_URL` | auto-wired to the ML service by the blueprint |

   **digicrave-ml**
   | Var | Value |
   |-----|-------|
   | `MONGODB_URI` | same Atlas URI |
   | `CORS_ORIGINS` | your API URL, e.g. `https://digicrave-pos-api.onrender.com` |

4. Deploy. Note the two service URLs.

> **Railway alternative:** create two services from the repo pointing at
> `Restaurant_POS_System/pos-backend` and `Restaurant_POS_ML`. `railway.json`
> in each folder sets the start command & health check. Set the same env vars.

---

## 3. Frontend — Vercel

1. On Vercel: **Add New → Project** → import this repo.
2. Vercel reads `vercel.json` (build = the frontend, output =
   `Restaurant_POS_System/pos-frontend/dist`, SPA rewrites for React Router).
3. Add **Environment Variables** (Production):
   | Var | Value |
   |-----|-------|
   | `VITE_BACKEND_URL` | your backend URL, e.g. `https://digicrave-pos-api.onrender.com` |
   | `VITE_RAZORPAY_KEY_ID` | your Razorpay key id |
4. Deploy. Every push to `main` triggers a Vercel production deploy; PRs get
   preview URLs automatically.

> **Important:** after the frontend URL is known, set the backend's
> `CORS_ORIGIN` to that exact URL so cookies/auth work cross-site.

### Cross-site cookies (auth)
The backend sets a JWT in an httpOnly cookie. For the Vercel frontend and the
Render backend to share it across domains, the cookie must be
`SameSite=None; Secure`. In production, set that in the backend's cookie options
(`res.cookie('accessToken', token, { httpOnly: true, secure: true, sameSite: 'none' })`).
Both sites are HTTPS on Vercel/Render, so this works.

---

## 4. CI/CD — GitHub Actions

`.github/workflows/ci.yml` runs on every push to `main`/`navin` and every PR:

- **backend-tests** — spins up MongoDB, runs Jest + Supertest (23 tests).
- **ml-tests** — spins up MongoDB, runs pytest (7 tests).
- **frontend-build** — eslint + production `vite build`.

Deploys themselves are handled by the platforms' own Git integrations
(Vercel + Render/Railway auto-deploy on push), so **no deploy tokens are stored
in GitHub Actions**. CI is the quality gate; the platforms do the shipping.

---

## 5. Local production check

```bash
# Frontend prod build
cd Restaurant_POS_System/pos-frontend && npm run build && npm run preview

# Backend (needs MONGODB_URI + JWT_SECRET)
cd Restaurant_POS_System/pos-backend && npm start

# ML service
cd Restaurant_POS_ML && bash run.sh

# Full test suite
bash tests/run-all-tests.sh
```

---

## 6. Environment variables reference

| Service | Variable | Required | Notes |
|---------|----------|----------|-------|
| frontend | `VITE_BACKEND_URL` | ✅ | Full backend base URL (prod). Empty in dev (Vite proxy). |
| frontend | `VITE_RAZORPAY_KEY_ID` | for payments | Razorpay public key id |
| backend | `MONGODB_URI` | ✅ | Atlas connection string |
| backend | `JWT_SECRET` | ✅ | Auth token signing secret |
| backend | `CORS_ORIGIN` | ✅ | Frontend origin (Vercel URL) |
| backend | `ML_SERVICE_URL` | ✅ | ML service base URL |
| backend | `PORT` | auto | Injected by host |
| backend | `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` | for payments | |
| ml | `MONGODB_URI` | ✅ | Same Atlas URI |
| ml | `CORS_ORIGINS` | ✅ | Comma-separated allowed origins (the API) |
| ml | `PORT` | auto | Injected by host; uvicorn binds `$PORT` |
