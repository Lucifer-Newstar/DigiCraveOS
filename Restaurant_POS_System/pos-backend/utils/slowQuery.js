const config = require("../config/config");

const measureQuery = async (label, operation) => {
  const startedAt = Date.now();
  const result = await operation();
  const durationMs = Date.now() - startedAt;
  if (durationMs >= config.slowQueryMs) {
    console.warn(JSON.stringify({ type: "slow_query", label, durationMs, thresholdMs: config.slowQueryMs }));
  }
  return result;
};

module.exports = { measureQuery };
