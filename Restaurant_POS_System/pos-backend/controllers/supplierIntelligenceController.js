const { Purchase, Ingredient, Supplier } = require("../models/inventoryModel");

const getSupplierIntelligence = async (req, res, next) => {
  try {
    const [purchases, ingredients, suppliers] = await Promise.all([Purchase.find({}).populate("supplier", "name").populate("lines.ingredient", "name unit").lean(), Ingredient.find({}).select("name unit").lean(), Supplier.find({}).select("name").lean()]);
    const costs = new Map();
    purchases.forEach((purchase) => (purchase.lines || []).forEach((line) => {
      const key = String(line.ingredient?._id || line.ingredient);
      const current = costs.get(key) || { ingredientId: key, ingredientName: line.ingredient?.name || "Unknown", unit: line.ingredient?.unit || "", quotes: [] };
      current.quotes.push({ supplier: purchase.supplier?.name || "Unassigned", unitCost: Number(line.unitCost || 0), receivedAt: purchase.receivedAt });
      costs.set(key, current);
    }));
    ingredients.forEach((ingredient) => { if (!costs.has(String(ingredient._id))) costs.set(String(ingredient._id), { ingredientId: ingredient._id, ingredientName: ingredient.name, unit: ingredient.unit, quotes: [] }); });
    const items = [...costs.values()].map((item) => ({ ...item, lowestCost: item.quotes.length ? Math.min(...item.quotes.map((quote) => quote.unitCost)) : null, latestCost: item.quotes.length ? item.quotes[item.quotes.length - 1].unitCost : null }));
    res.json({ success: true, data: { suppliers: suppliers.length, purchases: purchases.length, items } });
  } catch (error) { next(error); }
};

module.exports = { getSupplierIntelligence };
