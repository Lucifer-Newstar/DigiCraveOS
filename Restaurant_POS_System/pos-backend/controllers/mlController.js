const createHttpError = require("http-errors");

// Base URL of the Python ML microservice (Restaurant_POS_ML).
// Configurable via env so it can point at a container / remote host.
const ML_SERVICE_URL = (process.env.ML_SERVICE_URL || "http://localhost:8100").replace(/\/$/, "");
const ML_TIMEOUT_MS = Number(process.env.ML_TIMEOUT_MS || 8000);

// Small helper that forwards a request to the ML service using Node's
// built-in fetch (Node >= 18) with a timeout, so no extra npm dependency
// is required.
const callMlService = async (path, { method = "GET", body } = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);
  try {
    const res = await fetch(`${ML_SERVICE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
};

const proxy = (path, options) => async (req, res, next) => {
  try {
    const { ok, status, data } = await callMlService(path(req), options?.(req));
    if (!ok) {
      return next(createHttpError(status || 502, data?.detail || "ML service error"));
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    // ML service unreachable / timed out -> graceful 503 the UI can handle.
    return next(
      createHttpError(
        503,
        `ML service unavailable: ${error.message}. Is Restaurant_POS_ML running?`
      )
    );
  }
};

// GET /api/ml/health
const health = proxy(() => "/health");

// GET /api/ml/forecast?horizon_days=7
const forecast = proxy(
  (req) => `/forecast?horizon_days=${encodeURIComponent(req.query.horizon_days || 7)}`
);

// GET /api/ml/demand?target_date=YYYY-MM-DD&top=12
const demand = proxy((req) => {
  const params = new URLSearchParams();
  if (req.query.target_date) params.set("target_date", req.query.target_date);
  params.set("top", req.query.top || 12);
  return `/demand?${params.toString()}`;
});

// GET /api/ml/popular?limit=10
const popular = proxy(
  (req) => `/popular?limit=${encodeURIComponent(req.query.limit || 10)}`
);

// POST /api/ml/recommend  { items: [...], limit }
const recommend = proxy(
  () => "/recommend",
  (req) => ({
    method: "POST",
    body: { items: req.body?.items || [], limit: req.body?.limit || 5 },
  })
);

module.exports = { health, forecast, demand, popular, recommend };
