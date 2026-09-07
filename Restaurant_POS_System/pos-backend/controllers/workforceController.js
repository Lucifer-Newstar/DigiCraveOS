const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const Shift = require("../models/shiftModel");
const User = require("../models/userModel");

const listShifts = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
    const [shifts, total] = await Promise.all([
      Shift.find().populate("staff", "name email role").sort({ startedAt: -1 }).skip((page - 1) * limit).limit(limit),
      Shift.countDocuments(),
    ]);
    res.json({ success: true, data: shifts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

const startShift = async (req, res, next) => {
  try {
    const { staff, hourlyRate, notes } = req.body;
    if (!mongoose.Types.ObjectId.isValid(staff) || !(await User.exists({ _id: staff }))) return next(createHttpError(404, "Staff member not found."));
    if (await Shift.exists({ staff, status: "Open" })) return next(createHttpError(409, "This staff member already has an open shift."));
    const shift = await Shift.create({ staff, hourlyRate, notes });
    res.status(201).json({ success: true, data: await shift.populate("staff", "name email role") });
  } catch (error) { next(error); }
};

const closeShift = async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return next(createHttpError(404, "Shift not found."));
    if (shift.status !== "Open") return next(createHttpError(409, "Shift is already closed."));
    shift.endedAt = new Date();
    shift.breakMinutes = Math.max(0, Number(req.body.breakMinutes) || 0);
    shift.status = "Closed";
    await shift.save();
    res.json({ success: true, data: shift });
  } catch (error) { next(error); }
};

const getSummary = async (req, res, next) => {
  try {
    const shifts = await Shift.find({ status: "Closed" }).populate("staff", "name role");
    const summary = shifts.reduce((result, shift) => {
      const key = String(shift.staff?._id || "unknown");
      const minutes = Math.max(0, (new Date(shift.endedAt) - new Date(shift.startedAt)) / 60000 - shift.breakMinutes);
      if (!result[key]) result[key] = { staff: shift.staff, minutes: 0, estimatedPay: 0 };
      result[key].minutes += minutes;
      result[key].estimatedPay += (minutes / 60) * shift.hourlyRate;
      return result;
    }, {});
    res.json({ success: true, data: Object.values(summary).map((item) => ({ ...item, minutes: Math.round(item.minutes), estimatedPay: +item.estimatedPay.toFixed(2) })) });
  } catch (error) { next(error); }
};

module.exports = { listShifts, startShift, closeShift, getSummary };
