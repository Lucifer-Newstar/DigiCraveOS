const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const Table = require("../models/tableModel");
const { Reservation, Waitlist, RESERVATION_STATUSES } = require("../models/reservationModel");

const listReservations = async (req, res, next) => {
  try { res.json({ success: true, data: await Reservation.find().populate("table").sort({ date: 1, time: 1 }) }); }
  catch (error) { next(error); }
};

const addReservation = async (req, res, next) => {
  try {
    const { guestName, phone, date, time, partySize, table } = req.body;
    if (!guestName || !phone || !date || !time || !partySize) return next(createHttpError(400, "Guest, date, time, and party size are required."));
    const clash = await Reservation.findOne({ date, time, status: { $in: ["Pending", "Confirmed", "Seated"] }, ...(table ? { table } : {}) });
    if (clash) return next(createHttpError(409, "That reservation slot is already occupied."));
    if (table && !mongoose.Types.ObjectId.isValid(table)) return next(createHttpError(400, "Invalid table."));
    const reservation = await Reservation.create({ guestName, phone, date, time, partySize, table });
    res.status(201).json({ success: true, data: reservation });
  } catch (error) { next(error); }
};

const updateReservation = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(createHttpError(404, "Invalid reservation id."));
    if (req.body.status && !RESERVATION_STATUSES.includes(req.body.status)) return next(createHttpError(400, "Invalid reservation status."));
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!reservation) return next(createHttpError(404, "Reservation not found."));
    res.json({ success: true, data: reservation });
  } catch (error) { next(error); }
};

const listWaitlist = async (req, res, next) => {
  try { res.json({ success: true, data: await Waitlist.find({ status: "Waiting" }).sort({ createdAt: 1 }) }); }
  catch (error) { next(error); }
};

const addWaitlist = async (req, res, next) => {
  try {
    const { guestName, phone, partySize } = req.body;
    if (!guestName || !phone || !partySize) return next(createHttpError(400, "Guest, phone, and party size are required."));
    const entry = await Waitlist.create({ guestName, phone, partySize });
    res.status(201).json({ success: true, data: entry });
  } catch (error) { next(error); }
};

const updateWaitlist = async (req, res, next) => {
  try {
    const entry = await Waitlist.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!entry) return next(createHttpError(404, "Waitlist entry not found."));
    res.json({ success: true, data: entry });
  } catch (error) { next(error); }
};

module.exports = { listReservations, addReservation, updateReservation, listWaitlist, addWaitlist, updateWaitlist };
