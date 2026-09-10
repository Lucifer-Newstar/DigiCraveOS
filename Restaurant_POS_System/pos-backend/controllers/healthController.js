const mongoose = require("mongoose");

const getLiveness = (req, res) => res.status(200).json({ success: true, data: { status: "ok", service: "pos-backend", uptimeSeconds: Math.floor(process.uptime()) } });

const getReadiness = (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  const status = databaseReady ? "ready" : "not_ready";
  res.status(databaseReady ? 200 : 503).json({ success: databaseReady, data: { status, checks: { database: databaseReady ? "up" : "down" } } });
};

const getProcessMetrics = (req, res) => {
  const memory = process.memoryUsage();
  res.json({ success: true, data: { service: "pos-backend", uptimeSeconds: Math.floor(process.uptime()), nodeVersion: process.version, pid: process.pid, memory: { rssBytes: memory.rss, heapUsedBytes: memory.heapUsed, heapTotalBytes: memory.heapTotal, externalBytes: memory.external }, database: { readyState: mongoose.connection.readyState, host: mongoose.connection.host || null, name: mongoose.connection.name || null } } });
};

module.exports = { getLiveness, getReadiness, getProcessMetrics };
