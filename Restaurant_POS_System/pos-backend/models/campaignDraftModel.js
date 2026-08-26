const mongoose = require("mongoose");

const campaignDraftSchema = new mongoose.Schema({
  draftId: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  channel: { type: String, required: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  audienceCount: { type: Number, default: 0, min: 0 },
  audience: [{ _id: mongoose.Schema.Types.ObjectId, name: String, phone: String, email: String }],
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("CampaignDraft", campaignDraftSchema);
