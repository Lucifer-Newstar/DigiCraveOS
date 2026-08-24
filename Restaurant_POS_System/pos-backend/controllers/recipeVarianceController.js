const { Recipe } = require("../models/inventoryModel");

const round = (value) => Number(Number(value || 0).toFixed(2));

const weightedCost = (ingredient) => {
  const batches = (ingredient?.batches || []).filter((batch) => Number(batch.quantity) > 0);
  const quantity = batches.reduce((sum, batch) => sum + Number(batch.quantity), 0);
  return quantity ? batches.reduce((sum, batch) => sum + Number(batch.quantity) * Number(batch.unitCost), 0) / quantity : 0;
};

const getRecipeCostVariance = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({}).populate("dish", "name price").populate("ingredients.ingredient", "name unit batches movements").lean();
    const items = recipes.filter((recipe) => recipe.dish).map((recipe) => {
      let currentCost = 0;
      let baselineCost = 0;
      const lines = recipe.ingredients.map((line) => {
        const ingredient = line.ingredient;
        const currentUnitCost = weightedCost(ingredient);
        const purchases = (ingredient?.movements || []).filter((movement) => movement.type === "PURCHASE" && Number(movement.unitCost) >= 0);
        const baselineUnitCost = purchases.length ? Number(purchases[0].unitCost) : currentUnitCost;
        const quantity = Number(line.quantity || 0);
        const currentLineCost = quantity * currentUnitCost;
        const baselineLineCost = quantity * baselineUnitCost;
        currentCost += currentLineCost;
        baselineCost += baselineLineCost;
        return { ingredientId: ingredient?._id || null, ingredientName: ingredient?.name || "Unknown", unit: ingredient?.unit || "", quantity, currentUnitCost: round(currentUnitCost), baselineUnitCost: round(baselineUnitCost), currentLineCost: round(currentLineCost), variance: round(currentLineCost - baselineLineCost) };
      });
      const variance = currentCost - baselineCost;
      return { dishId: recipe.dish._id, dishName: recipe.dish.name, menuPrice: Number(recipe.dish.price || 0), currentCost: round(currentCost), baselineCost: round(baselineCost), variance: round(variance), variancePct: baselineCost ? round((variance / baselineCost) * 100) : null, status: variance > 0.01 ? "increased" : variance < -0.01 ? "decreased" : "stable", lines };
    });
    res.json({ success: true, data: { recipes: items.length, increased: items.filter((item) => item.status === "increased").length, items } });
  } catch (error) { next(error); }
};

module.exports = { getRecipeCostVariance };
