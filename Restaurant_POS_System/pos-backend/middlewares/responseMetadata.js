const responseMetadata = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body && typeof body === "object" && !Array.isArray(body) && !body.meta) {
      return originalJson({ ...body, meta: { requestId: req.requestId } });
    }
    return originalJson(body);
  };
  next();
};

module.exports = responseMetadata;
