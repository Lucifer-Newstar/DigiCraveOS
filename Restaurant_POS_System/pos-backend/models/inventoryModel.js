const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    unit: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, min: 0, default: 0 },
    batches: [{
      quantity: { type: Number, min: 0 },
      unitCost: { type: Number, min: 0 },
      receivedAt: { type: Date, default: Date.now },
    }],
    movements: [{
      type: { type: String, enum: ["PURCHASE", "CONSUMPTION"] },
      quantity: Number,
      unitCost: Number,
      reference: String,
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

const recipeSchema = new mongoose.Schema(
  {
    dish: { type: mongoose.Schema.Types.ObjectId, ref: "Dish", required: true, unique: true },
    ingredients: [
      {
        ingredient: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient", required: true },
        quantity: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

const supplierSchema = new mongoose.Schema(
  { name: { type: String, required: true, trim: true }, phone: String, notes: String },
  { timestamps: true }
);

const purchaseSchema = new mongoose.Schema(
  {
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    lines: [{ ingredient: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient", required: true }, quantity: { type: Number, min: 0, required: true }, unitCost: { type: Number, min: 0, required: true } }],
    receivedAt: { type: Date, default: Date.now },
    totalCost: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

purchaseSchema.index({ receivedAt: -1 });
purchaseSchema.index({ "lines.ingredient": 1, receivedAt: -1 });

module.exports = {
  Ingredient: mongoose.model("Ingredient", ingredientSchema),
  Recipe: mongoose.model("Recipe", recipeSchema),
  Supplier: mongoose.model("Supplier", supplierSchema),
  Purchase: mongoose.model("Purchase", purchaseSchema),
};
