const AuditEvent = require("../models/auditEventModel");

const writeAuditEvent = async ({ req, action, resource, resourceId, metadata = {} }) => {
  if (!req?.user?._id) return null;
  return AuditEvent.create({ action, resource, resourceId: resourceId ? String(resourceId) : undefined, actor: req.user._id, metadata });
};

module.exports = { writeAuditEvent };
