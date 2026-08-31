const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const Dish = require("../models/dishModel");
const { Ingredient, Recipe, Supplier, Purchase } = require("../models/inventoryModel");

const getInventory = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
    const [ingredients, ingredientTotal, valuationRows, recipes, suppliers, purchases] = await Promise.all([
      Ingredient.find().sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
      Ingredient.countDocuments(),
      Ingredient.find().select("batches"),
      Recipe.find().populate("dish", "name").populate("ingredients.ingredient", "name unit"),
      Supplier.find().sort({ name: 1 }),
      Purchase.find().populate("supplier", "name").populate("lines.ingredient", "name unit").sort({ receivedAt: -1 }).limit(50),
    ]);
    const valuation = valuationRows.reduce((total, item) => total + (item.batches || []).reduce((sum, batch) => sum + batch.quantity * batch.unitCost, 0), 0);
    res.json({ success: true, data: { ingredients, recipes, suppliers, purchases, valuation: +valuation.toFixed(2), pagination: { page, limit, total: ingredientTotal, pages: Math.ceil(ingredientTotal / limit) } } });
  } catch (error) { next(error); }
};

const addIngredient = async (req, res, next) => {
  try {
    const { name, unit, stock, reorderLevel } = req.body;
    if (!name || !unit) return next(createHttpError(400, "Name and unit are required."));
    const ingredient = await Ingredient.create({ name, unit, stock, reorderLevel });
    res.status(201).json({ success: true, data: ingredient });
  } catch (error) {
    if (error.code === 11000) return next(createHttpError(409, "Ingredient already exists."));
    next(error);
  }
};

const updateIngredient = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(createHttpError(404, "Invalid ingredient id."));
    const ingredient = await Ingredient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ingredient) return next(createHttpError(404, "Ingredient not found."));
    res.json({ success: true, data: ingredient });
  } catch (error) { next(error); }
};

const upsertRecipe = async (req, res, next) => {
  try {
    const { dish, ingredients } = req.body;
    if (!mongoose.Types.ObjectId.isValid(dish) || !Array.isArray(ingredients) || !ingredients.length) {
      return next(createHttpError(400, "A dish and at least one recipe ingredient are required."));
    }
    if (!(await Dish.exists({ _id: dish }))) return next(createHttpError(404, "Dish not found."));
    const recipe = await Recipe.findOneAndUpdate({ dish }, { dish, ingredients }, { new: true, upsert: true, runValidators: true });
    res.json({ success: true, data: recipe });
  } catch (error) { next(error); }
};

const deductInventoryForOrder = async (order) => {
  if (order.inventoryDeducted) return;
  const dishIds = (order.items || []).map((item) => item.id).filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!dishIds.length) { order.inventoryDeducted = true; await order.save(); return; }
  const recipes = await Recipe.find({ dish: { $in: dishIds } });
  const required = new Map();
  for (const item of order.items || []) {
    const recipe = recipes.find((entry) => String(entry.dish) === String(item.id));
    for (const line of recipe?.ingredients || []) {
      const key = String(line.ingredient);
      required.set(key, (required.get(key) || 0) + line.quantity * (item.quantity || 1));
    }
  }
  for (const [ingredientId, quantity] of required) {
    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient || ingredient.stock < quantity) throw createHttpError(409, `Insufficient stock for ${ingredient?.name || ingredientId}.`);
  }
  for (const [ingredientId, quantity] of required) {
    const ingredient = await Ingredient.findById(ingredientId);
    let remaining = quantity;
    const batches = [...(ingredient.batches || [])].sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt));
    for (const batch of batches) {
      if (remaining <= 0) break;
      const used = Math.min(batch.quantity, remaining);
      batch.quantity -= used;
      remaining -= used;
      ingredient.movements.push({ type: "CONSUMPTION", quantity: used, unitCost: batch.unitCost, reference: String(order._id) });
    }
    ingredient.batches = batches.filter((batch) => batch.quantity > 0);
    ingredient.stock = Math.max(0, ingredient.stock - quantity);
    await ingredient.save();
  }
  order.inventoryDeducted = true;
  await order.save();
};

const addSupplier = async (req, res, next) => {
  try {
    if (!req.body.name?.trim()) return next(createHttpError(400, "Supplier name is required."));
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (error) { next(error); }
};

const addPurchase = async (req, res, next) => {
  try {
    const { supplier, lines, receivedAt } = req.body;
    if (!Array.isArray(lines) || !lines.length) return next(createHttpError(400, "At least one purchase line is required."));
    let totalCost = 0;
    for (const line of lines) {
      if (!mongoose.Types.ObjectId.isValid(line.ingredient) || Number(line.quantity) <= 0 || Number(line.unitCost) < 0) return next(createHttpError(400, "Invalid purchase line."));
      const ingredient = await Ingredient.findById(line.ingredient);
      if (!ingredient) return next(createHttpError(404, "Ingredient not found."));
      const quantity = Number(line.quantity);
      const unitCost = Number(line.unitCost);
      ingredient.stock += quantity;
      ingredient.batches.push({ quantity, unitCost, receivedAt: receivedAt || new Date() });
      ingredient.movements.push({ type: "PURCHASE", quantity, unitCost, reference: "purchase" });
      await ingredient.save();
      totalCost += quantity * unitCost;
    }
    const purchase = await Purchase.create({ supplier: supplier || undefined, lines, receivedAt, totalCost });
    res.status(201).json({ success: true, data: purchase });
  } catch (error) { next(error); }
};

module.exports = { getInventory, addIngredient, updateIngredient, upsertRecipe, addSupplier, addPurchase, deductInventoryForOrder };
