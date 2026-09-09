const crypto = require("crypto");
const Order = require("../models/orderModel");
const { writeAuditEvent } = require("../utils/auditEventWriter");

const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const exportOrdersCsv = async (req, res, next) => {
  try {
    const from = new Date(req.query.from || new Date(Date.now() - 30 * 86400000));
    const to = new Date(req.query.to || new Date());
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return res.status(400).json({ success: false, message: "Invalid date range." });
    to.setHours(23, 59, 59, 999);
    const orders = await Order.find({ orderDate: { $gte: from, $lte: to } }).sort({ orderDate: 1 }).lean();
    const rows = [["Date", "Order status", "Customer", "Phone", "Total", "Tax", "Total with tax"]];
    orders.forEach((order) => rows.push([order.orderDate?.toISOString(), order.orderStatus, order.customerDetails?.name, order.customerDetails?.phone, order.bills?.total, order.bills?.tax, order.bills?.totalWithTax]));
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const etag = `"${crypto.createHash("sha256").update(csv).digest("hex").slice(0, 32)}"`;
    if (req.get("If-None-Match") === etag) return res.status(304).set("ETag", etag).end();
    await writeAuditEvent({ req, action: "EXPORT", resource: "orders-csv", metadata: { from: from.toISOString(), to: to.toISOString(), rows: orders.length } });
    res.type("text/csv").set("ETag", etag).set("Cache-Control", "private, no-cache").set("Content-Disposition", `attachment; filename="orders-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}.csv"`).send(csv);
  } catch (error) { next(error); }
};

module.exports = { exportOrdersCsv };
