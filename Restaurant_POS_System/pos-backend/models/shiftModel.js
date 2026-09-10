const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
    breakMinutes: { type: Number, min: 0, default: 0 },
    hourlyRate: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ["Open", "Closed", "Absent"], default: "Open" },
    notes: String,
  },
  { timestamps: true }
);

shiftSchema.index({ staff: 1, status: 1 });
shiftSchema.index({ startedAt: -1 });
shiftSchema.index({ status: 1, startedAt: -1 });
module.exports = mongoose.model("Shift", shiftSchema);
