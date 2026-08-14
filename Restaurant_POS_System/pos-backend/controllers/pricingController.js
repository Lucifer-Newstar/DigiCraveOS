const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const Dish = require("../models/dishModel");
const { Recipe } = require("../models/inventoryModel");

const round = (value) => +(Number(value || 0).toFixed(2));
const unitCost = (ingredient) => {
  const batches = (ingredient?.batches || []).filter((batch) => Number(batch.quantity) > 0);
  if (batches.length) {
    const quantity = batches.reduce((sum, batch) => sum + Number(batch.quantity), 0);
    return quantity ? batches.reduce((sum, batch) => sum + Number(batch.quantity) * Number(batch.unitCost), 0) / quantity : 0;
  }
  const purchases = (ingredient?.movements || []).filter((movement) => movement.type === "PURCHASE");
  return purchases.length ? Number(purchases[purchases.length - 1].unitCost) : 0;
};

const getPricingRecommendations = async (req, res, next) => {
  try {
    const targetMargin = Number(req.query.targetMargin ?? 30);
    if (!Number.isFinite(targetMargin) || targetMargin < 1 || targetMargin >= 100) return next(createHttpError(400, "targetMargin must be between 1 and 99."));
    const start = new Date(req.query.from || new Date(new Date().setDate(new Date().getDate() - 30)));
    const end = new Date(req.query.to || new Date());
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return next(createHttpError(400, "Invalid date range."));
    end.setHours(23, 59, 59, 999);
    const [orders, dishes, recipes] = await Promise.all([
      Order.find({ orderDate: { $gte: start, $lte: end }, orderStatus: { $in: ["Paid", "Completed"] } }).lean(),
      Dish.find({}).lean(),
      Recipe.find({}).populate("dish").populate("ingredients.ingredient").lean(),
    ]);
    const dishById = new Map(dishes.map((dish) => [String(dish._id), dish]));
    const recipesByDish = new Map(recipes.filter((recipe) => recipe.dish?._id).map((recipe) => [String(recipe.dish._id), recipe]));
    const sales = new Map();
    orders.forEach((order) => (order.items || []).forEach((item) => {
      const dish = dishById.get(String(item.id)) || dishes.find((candidate) => candidate.name.toLowerCase() === item.name.toLowerCase());
      if (!dish) return;
      const sale = sales.get(String(dish._id)) || { dishId: dish._id, name: dish.name, unitsSold: 0, revenue: 0, menuPrice: dish.price };
      sale.unitsSold += Number(item.quantity || 1);
      sale.revenue += Number(item.price || 0);
      sales.set(String(dish._id), sale);
    }));
    const items = [...sales.values()].map((sale) => {
      const recipe = recipesByDish.get(String(sale.dishId));
      const cost = recipe ? recipe.ingredients.reduce((sum, line) => sum + Number(line.quantity || 0) * unitCost(line.ingredient), 0) : null;
      const suggestedPrice = cost === null ? null : round(cost / (1 - targetMargin / 100));
      const averagePrice = sale.unitsSold ? sale.revenue / sale.unitsSold : sale.menuPrice;
      const currentMargin = cost === null || !averagePrice ? null : ((averagePrice - cost) / averagePrice) * 100;
      return { dishId: sale.dishId, name: sale.name, unitsSold: sale.unitsSold, currentPrice: round(averagePrice), unitFoodCost: cost === null ? null : round(cost), currentMarginPct: currentMargin === null ? null : round(currentMargin), targetMarginPct: targetMargin, suggestedPrice, status: cost === null ? "needs_recipe" : currentMargin < targetMargin ? "review_price" : "on_target" };
    }).sort((a, b) => (a.currentMarginPct ?? -Infinity) - (b.currentMarginPct ?? -Infinity));
    res.json({ success: true, data: { from: start, to: end, targetMarginPct: targetMargin, items } });
  } catch (error) { next(error); }
};

module.exports = { getPricingRecommendations };
