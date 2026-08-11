const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const Dish = require("../models/dishModel");
const { Ingredient, Recipe } = require("../models/inventoryModel");

const getInventory = async (req, res, next) => {
  try {
    const [ingredients, recipes] = await Promise.all([
      Ingredient.find().sort({ name: 1 }),
      Recipe.find().populate("dish", "name").populate("ingredients.ingredient", "name unit"),
    ]);
    res.json({ success: true, data: { ingredients, recipes } });
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
    await Ingredient.findByIdAndUpdate(ingredientId, { $inc: { stock: -quantity } });
  }
  order.inventoryDeducted = true;
  await order.save();
};

module.exports = { getInventory, addIngredient, updateIngredient, upsertRecipe, deductInventoryForOrder };
