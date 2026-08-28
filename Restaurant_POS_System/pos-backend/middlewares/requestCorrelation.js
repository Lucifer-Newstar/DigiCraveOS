const { randomUUID } = require("crypto");

const requestCorrelation = (req, res, next) => {
  const supplied = req.get("x-request-id");
  const requestId = supplied && /^[A-Za-z0-9._:-]{1,100}$/.test(supplied) ? supplied : randomUUID();
  req.requestId = requestId;
  res.set("X-Request-Id", requestId);
  next();
};

module.exports = requestCorrelation;
