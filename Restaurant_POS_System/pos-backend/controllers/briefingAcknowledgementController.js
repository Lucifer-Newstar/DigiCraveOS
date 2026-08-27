const createHttpError = require("http-errors");
const BriefingAcknowledgement = require("../models/briefingAcknowledgementModel");

const getAcknowledgements = async (req, res, next) => {
  try { res.json({ success: true, data: { acknowledgements: await BriefingAcknowledgement.find({ acknowledgedBy: req.user._id }).sort({ acknowledgedAt: -1 }).lean() } }); } catch (error) { next(error); }
};
const acknowledgeBriefing = async (req, res, next) => {
  try {
    const insightKey = String(req.body.insightKey || "").trim();
    if (!insightKey || insightKey.length > 160) return next(createHttpError(400, "A valid insight key is required."));
    const acknowledgement = await BriefingAcknowledgement.findOneAndUpdate({ insightKey }, { insightKey, acknowledgedBy: req.user._id, acknowledgedAt: new Date() }, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.status(201).json({ success: true, data: acknowledgement });
  } catch (error) { next(error); }
};
module.exports = { getAcknowledgements, acknowledgeBriefing };
