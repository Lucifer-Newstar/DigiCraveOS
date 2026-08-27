const mongoose = require("mongoose");

const auditEventSchema = new mongoose.Schema({
  action: { type: String, required: true, trim: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resource: { type: String, required: true, trim: true },
  resourceId: String,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

auditEventSchema.index({ action: 1, resource: 1, createdAt: -1 });
module.exports = mongoose.model("AuditEvent", auditEventSchema);
