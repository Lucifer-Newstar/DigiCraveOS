const createHttpError = require("http-errors");
const AuditEvent = require("../models/auditEventModel");

const getAuditEvents = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const filter = {};
    if (req.query.action) filter.action = String(req.query.action).slice(0, 80);
    if (req.query.resource) filter.resource = String(req.query.resource).slice(0, 80);
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
      if (Object.values(filter.createdAt).some((date) => Number.isNaN(date.getTime()))) return next(createHttpError(400, "Invalid audit date range."));
    }
    const events = await AuditEvent.find(filter).sort({ createdAt: -1 }).limit(limit).populate("actor", "name email").lean();
    res.json({ success: true, data: { total: events.length, events } });
  } catch (error) { next(error); }
};

module.exports = { getAuditEvents };
