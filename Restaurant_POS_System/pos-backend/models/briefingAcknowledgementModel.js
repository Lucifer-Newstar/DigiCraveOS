const mongoose = require("mongoose");

const briefingAcknowledgementSchema = new mongoose.Schema({
  insightKey: { type: String, required: true, unique: true, trim: true },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  acknowledgedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("BriefingAcknowledgement", briefingAcknowledgementSchema);
