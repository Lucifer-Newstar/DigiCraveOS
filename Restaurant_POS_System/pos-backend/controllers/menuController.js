const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const Category = require("../models/categoryModel");
const Dish = require("../models/dishModel");

/* ----------------------------- Categories ----------------------------- */

const addCategory = async (req, res, next) => {
  try {
    const { name, icon, bgColor } = req.body;
    if (!name || !name.trim()) {
      return next(createHttpError(400, "Category name is required!"));
    }
    const category = await Category.create({
      name: name.trim(),
      icon: icon || "🍽️",
      bgColor: bgColor || "#5b45b0",
    });
    res
      .status(201)
      .json({ success: true, message: "Category added!", data: category });
  } catch (error) {
    if (error.code === 11000) {
      return next(createHttpError(409, "Category already exists!"));
    }
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid category id!"));
    }
    const category = await Category.findByIdAndDelete(id);
    if (!category) return next(createHttpError(404, "Category not found!"));
    // Cascade: remove dishes belonging to this category.
    await Dish.deleteMany({ category: id });
    res
      .status(200)
      .json({ success: true, message: "Category deleted!", data: category });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------- Dishes ------------------------------- */

const addDish = async (req, res, next) => {
  try {
    const { name, price, category, image, isAvailable } = req.body;
    if (!name || !name.trim()) {
      return next(createHttpError(400, "Dish name is required!"));
    }
    if (price === undefined || price === null || Number(price) < 0) {
      return next(createHttpError(400, "A valid price is required!"));
    }
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return next(createHttpError(400, "A valid category is required!"));
    }
    const exists = await Category.findById(category);
    if (!exists) return next(createHttpError(404, "Category not found!"));

    const dish = await Dish.create({
      name: name.trim(),
      price: Number(price),
      category,
      image: image || "",
      isAvailable: isAvailable !== undefined ? !!isAvailable : true,
    });
    res.status(201).json({ success: true, message: "Dish added!", data: dish });
  } catch (error) {
    next(error);
  }
};

// Returns dishes grouped under their category so the frontend can render
// the same shape it used for the hardcoded `menus` constant.
const getMenu = async (req, res, next) => {
  try {
    const [categories, dishes] = await Promise.all([
      Category.find().sort({ createdAt: 1 }),
      Dish.find().sort({ createdAt: 1 }),
    ]);

    const menu = categories.map((cat) => ({
      _id: cat._id,
      id: cat._id,
      name: cat.name,
      icon: cat.icon,
      bgColor: cat.bgColor,
      items: dishes
        .filter((d) => String(d.category) === String(cat._id))
        .map((d) => ({
          _id: d._id,
          id: d._id,
          name: d.name,
          price: d.price,
          image: d.image,
          isAvailable: d.isAvailable,
          category: { name: cat.name },
        })),
    }));

    res.status(200).json({ success: true, data: menu });
  } catch (error) {
    next(error);
  }
};

const getDishes = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category && mongoose.Types.ObjectId.isValid(req.query.category)) {
      filter.category = req.query.category;
    }
    const dishes = await Dish.find(filter).populate("category", "name icon");
    res.status(200).json({ success: true, data: dishes });
  } catch (error) {
    next(error);
  }
};

const updateDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid dish id!"));
    }
    const dish = await Dish.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!dish) return next(createHttpError(404, "Dish not found!"));
    res.status(200).json({ success: true, message: "Dish updated!", data: dish });
  } catch (error) {
    next(error);
  }
};

const deleteDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid dish id!"));
    }
    const dish = await Dish.findByIdAndDelete(id);
    if (!dish) return next(createHttpError(404, "Dish not found!"));
    res.status(200).json({ success: true, message: "Dish deleted!", data: dish });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addCategory,
  getCategories,
  deleteCategory,
  addDish,
  getMenu,
  getDishes,
  updateDish,
  deleteDish,
};
