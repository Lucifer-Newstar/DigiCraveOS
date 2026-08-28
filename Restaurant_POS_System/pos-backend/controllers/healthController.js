const mongoose = require("mongoose");

const getLiveness = (req, res) => res.status(200).json({ success: true, data: { status: "ok", service: "pos-backend", uptimeSeconds: Math.floor(process.uptime()) } });

const getReadiness = (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  const status = databaseReady ? "ready" : "not_ready";
  res.status(databaseReady ? 200 : 503).json({ success: databaseReady, data: { status, checks: { database: databaseReady ? "up" : "down" } } });
};

module.exports = { getLiveness, getReadiness };
