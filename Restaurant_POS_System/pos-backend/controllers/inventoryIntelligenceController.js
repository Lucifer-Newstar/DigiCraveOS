const { Ingredient } = require("../models/inventoryModel");

const getInventoryIntelligence = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find({}).lean();
    const cost = (ingredient) => {
      const batches = (ingredient.batches || []).filter((batch) => Number(batch.quantity) > 0);
      const quantity = batches.reduce((sum, batch) => sum + Number(batch.quantity), 0);
      return quantity ? batches.reduce((sum, batch) => sum + Number(batch.quantity) * Number(batch.unitCost), 0) / quantity : 0;
    };
    const items = ingredients.map((ingredient) => ({ ...ingredient, unitCost: +cost(ingredient).toFixed(2), shortage: Math.max(0, Number(ingredient.reorderLevel || 0) - Number(ingredient.stock || 0)), suggestedPurchase: Math.max(0, Number(ingredient.reorderLevel || 0) * 2 - Number(ingredient.stock || 0)) }));
    const lowStock = items.filter((item) => item.shortage > 0 || item.stock === 0);
    const stockValue = +items.reduce((sum, item) => sum + Number(item.stock || 0) * item.unitCost, 0).toFixed(2);
    res.json({ success: true, data: { totalIngredients: items.length, lowStockCount: lowStock.length, stockValue, lowStock } });
  } catch (error) { next(error); }
};

module.exports = { getInventoryIntelligence };
