const AuditEvent = require("../models/auditEventModel");

const getAdminActivitySummary = async (req, res, next) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 30);
    const from = new Date(Date.now() - days * 86400000);
    const [byAction, byResource, total] = await Promise.all([
      AuditEvent.aggregate([{ $match: { createdAt: { $gte: from } } }, { $group: { _id: "$action", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AuditEvent.aggregate([{ $match: { createdAt: { $gte: from } } }, { $group: { _id: "$resource", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AuditEvent.countDocuments({ createdAt: { $gte: from } }),
    ]);
    res.json({ success: true, data: { days, from, total, byAction: byAction.map((item) => ({ action: item._id, count: item.count })), byResource: byResource.map((item) => ({ resource: item._id, count: item.count })) } });
  } catch (error) { next(error); }
};

module.exports = { getAdminActivitySummary };
