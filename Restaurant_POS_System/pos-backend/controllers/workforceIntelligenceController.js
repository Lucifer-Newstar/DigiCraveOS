const Shift = require("../models/shiftModel");

const getWorkforceIntelligence = async (req, res, next) => {
  try {
    const shifts = await Shift.find({ status: "Open" }).populate("staff", "name role").lean();
    const now = Date.now();
    const items = shifts.map((shift) => ({ shiftId: shift._id, staff: shift.staff, startedAt: shift.startedAt, hourlyRate: shift.hourlyRate, openMinutes: Math.max(0, Math.floor((now - new Date(shift.startedAt).getTime()) / 60000)), estimatedPay: +((Math.max(0, (now - new Date(shift.startedAt).getTime()) / 3600000)) * Number(shift.hourlyRate || 0)).toFixed(2) }));
    const estimatedLiability = +items.reduce((sum, item) => sum + item.estimatedPay, 0).toFixed(2);
    const byRole = items.reduce((roles, item) => { const role = item.staff?.role || "Unknown"; roles[role] = (roles[role] || 0) + 1; return roles; }, {});
    res.json({ success: true, data: { openShifts: items.length, estimatedLiability, byRole, shifts: items } });
  } catch (error) { next(error); }
};

module.exports = { getWorkforceIntelligence };
