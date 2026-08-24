const { app, request, loginAsAdmin } = require("./helpers");
const Dish = require("../../Restaurant_POS_System/pos-backend/models/dishModel");
const Category = require("../../Restaurant_POS_System/pos-backend/models/categoryModel");
const { Ingredient, Recipe } = require("../../Restaurant_POS_System/pos-backend/models/inventoryModel");

describe("Phase 3 recipe cost variance", () => {
  test("Admin receives recipe line cost changes against the first purchase baseline", async () => {
    const { cookie } = await loginAsAdmin();
    const ingredient = await Ingredient.create({ name: `Variance Oil ${Date.now()}`, unit: "litre", stock: 10, batches: [{ quantity: 10, unitCost: 30 }], movements: [{ type: "PURCHASE", quantity: 5, unitCost: 20 }, { type: "PURCHASE", quantity: 10, unitCost: 30 }] });
    const category = await Category.create({ name: `Variance Category ${Date.now()}` });
    const dish = await Dish.create({ name: `Variance Dish ${Date.now()}`, price: 150, category: category._id, isAvailable: true });
    await Recipe.create({ dish: dish._id, ingredients: [{ ingredient: ingredient._id, quantity: 2 }] });

    const response = await request(app).get("/api/inventory/recipe-variance").set("Cookie", cookie);
    expect(response.status).toBe(200);
    const item = response.body.data.items.find((entry) => entry.dishName.startsWith("Variance Dish"));
    expect(item.currentCost).toBe(60);
    expect(item.baselineCost).toBe(40);
    expect(item.variance).toBe(20);
    expect(item.status).toBe("increased");
    expect(item.lines[0].currentUnitCost).toBe(30);
  });
});
