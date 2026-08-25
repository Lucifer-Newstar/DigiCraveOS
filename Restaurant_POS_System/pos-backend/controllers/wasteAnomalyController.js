const { Ingredient } = require("../models/inventoryModel");

const round = (value) => Number(Number(value || 0).toFixed(2));

const getWasteAnomalies = async (req, res, next) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 30);
    const now = Date.now();
    const recentStart = now - days * 86400000;
    const baselineStart = recentStart - days * 86400000;
    const ingredients = await Ingredient.find({}).select("name unit movements").lean();
    const items = ingredients.map((ingredient) => {
      const movements = (ingredient.movements || []).filter((movement) => movement.type === "CONSUMPTION");
      const recent = movements.filter((movement) => new Date(movement.createdAt).getTime() >= recentStart).reduce((sum, movement) => sum + Number(movement.quantity || 0), 0);
      const baseline = movements.filter((movement) => { const time = new Date(movement.createdAt).getTime(); return time >= baselineStart && time < recentStart; }).reduce((sum, movement) => sum + Number(movement.quantity || 0), 0);
      const expected = baseline / days;
      const actual = recent / days;
      const variance = actual - expected;
      return { ingredientId: ingredient._id, ingredientName: ingredient.name, unit: ingredient.unit, recentQuantity: round(recent), baselineQuantity: round(baseline), dailyAverage: round(actual), expectedDailyAverage: round(expected), variance: round(variance), variancePct: expected ? round((variance / expected) * 100) : null, status: expected && actual > expected * 1.5 ? "anomaly" : "normal" };
    }).filter((item) => item.recentQuantity > 0 || item.baselineQuantity > 0);
    res.json({ success: true, data: { days, anomalies: items.filter((item) => item.status === "anomaly").length, items } });
  } catch (error) { next(error); }
};

module.exports = { getWasteAnomalies };
