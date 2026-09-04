const createHttpError = require("http-errors");

const buckets = new Map();

const rateLimit = ({ windowMs = 60_000, max = 60, keyGenerator = (req) => req.ip || "unknown" } = {}) => (req, res, next) => {
  const now = Date.now();
  const key = `${req.path}:${keyGenerator(req)}`;
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    res.set("X-RateLimit-Limit", String(max));
    res.set("X-RateLimit-Remaining", String(Math.max(max - 1, 0)));
    return next();
  }
  current.count += 1;
  res.set("X-RateLimit-Limit", String(max));
  res.set("X-RateLimit-Remaining", String(Math.max(max - current.count, 0)));
  res.set("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
  if (current.count > max) return next(createHttpError(429, "Too many requests. Please retry later."));
  return next();
};

rateLimit.reset = () => buckets.clear();
module.exports = rateLimit;
