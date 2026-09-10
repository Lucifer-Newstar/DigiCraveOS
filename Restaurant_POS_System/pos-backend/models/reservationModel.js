const mongoose = require("mongoose");

const RESERVATION_STATUSES = ["Pending", "Confirmed", "Seated", "Completed", "Cancelled", "No Show"];

const reservationSchema = new mongoose.Schema(
  {
    guestName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    partySize: { type: Number, required: true, min: 1 },
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    status: { type: String, enum: RESERVATION_STATUSES, default: "Pending" },
  },
  { timestamps: true }
);

reservationSchema.index({ date: 1, time: 1, status: 1 });
reservationSchema.index({ status: 1, date: 1 });

const waitlistSchema = new mongoose.Schema(
  {
    guestName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    partySize: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["Waiting", "Seated", "Cancelled"], default: "Waiting" },
  },
  { timestamps: true }
);

module.exports = {
  Reservation: mongoose.model("Reservation", reservationSchema),
  Waitlist: mongoose.model("Waitlist", waitlistSchema),
  RESERVATION_STATUSES,
};
