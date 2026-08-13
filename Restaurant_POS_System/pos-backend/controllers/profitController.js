const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const Dish = require("../models/dishModel");
const { Recipe } = require("../models/inventoryModel");

const round = (value) => +(Number(value || 0).toFixed(2));

function ingredientUnitCost(ingredient) {
  const batches = (ingredient?.batches || []).filter((batch) => Number(batch.quantity) > 0);
  if (batches.length) {
    const quantity = batches.reduce((sum, batch) => sum + Number(batch.quantity), 0);
    return quantity ? batches.reduce((sum, batch) => sum + Number(batch.quantity) * Number(batch.unitCost), 0) / quantity : 0;
  }
  const purchases = (ingredient?.movements || []).filter((movement) => movement.type === "PURCHASE" && Number(movement.unitCost) >= 0);
  return purchases.length ? Number(purchases[purchases.length - 1].unitCost) : 0;
}

const getProfitReport = async (req, res, next) => {
  try {
    const start = new Date(req.query.from || new Date(new Date().setDate(new Date().getDate() - 30)));
    const end = new Date(req.query.to || new Date());
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return next(createHttpError(400, "Invalid date range."));
    end.setHours(23, 59, 59, 999);

    const [orders, dishes, recipes] = await Promise.all([
      Order.find({ orderDate: { $gte: start, $lte: end }, orderStatus: { $in: ["Paid", "Completed"] } }).lean(),
      Dish.find({}).lean(),
      Recipe.find({}).populate("dish").populate("ingredients.ingredient").lean(),
    ]);

    const recipeByDish = new Map(recipes.filter((recipe) => recipe.dish?._id).map((recipe) => [String(recipe.dish._id), recipe]));
    const dishById = new Map(dishes.map((dish) => [String(dish._id), dish]));
    const sold = new Map();
    for (const order of orders) {
      for (const item of order.items || []) {
        const key = dishById.has(String(item.id)) ? String(item.id) : `name:${String(item.name).trim().toLowerCase()}`;
        const current = sold.get(key) || { id: dishById.has(String(item.id)) ? String(item.id) : null, name: item.name, unitsSold: 0, revenue: 0 };
        current.unitsSold += Number(item.quantity || 1);
        current.revenue += Number(item.price || 0);
        sold.set(key, current);
      }
    }

    const items = [...sold.values()].map((sale) => {
      const dish = sale.id ? dishById.get(sale.id) : dishes.find((candidate) => candidate.name.trim().toLowerCase() === sale.name.trim().toLowerCase());
      const recipe = dish ? recipeByDish.get(String(dish._id)) : null;
      const unitCost = recipe ? recipe.ingredients.reduce((sum, line) => sum + Number(line.quantity || 0) * ingredientUnitCost(line.ingredient), 0) : null;
      const foodCost = unitCost === null ? null : unitCost * sale.unitsSold;
      const grossProfit = foodCost === null ? null : sale.revenue - foodCost;
      const marginPct = grossProfit === null || !sale.revenue ? null : (grossProfit / sale.revenue) * 100;
      return {
        dishId: dish?._id || null,
        name: sale.name,
        unitsSold: sale.unitsSold,
        revenue: round(sale.revenue),
        unitFoodCost: unitCost === null ? null : round(unitCost),
        foodCost: foodCost === null ? null : round(foodCost),
        grossProfit: grossProfit === null ? null : round(grossProfit),
        marginPct: marginPct === null ? null : round(marginPct),
        status: recipe ? (marginPct >= 60 ? "high_margin" : marginPct < 30 ? "low_margin" : "healthy") : "no_recipe",
        recommendation: !recipe ? "Add a recipe to measure food cost." : marginPct < 30 ? "Review price, portion size, or ingredient cost." : null,
      };
    }).sort((a, b) => (b.grossProfit ?? -Infinity) - (a.grossProfit ?? -Infinity));

    const measured = items.filter((item) => item.grossProfit !== null);
    const revenue = round(items.reduce((sum, item) => sum + item.revenue, 0));
    const foodCost = round(measured.reduce((sum, item) => sum + item.foodCost, 0));
    const grossProfit = round(measured.reduce((sum, item) => sum + item.grossProfit, 0));
    res.json({ success: true, data: { from: start, to: end, summary: { revenue, foodCost, grossProfit, marginPct: revenue ? round((grossProfit / revenue) * 100) : 0, measuredItems: measured.length, uncostedItems: items.length - measured.length }, items } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfitReport };
