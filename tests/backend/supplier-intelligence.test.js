const { app, request, loginAsAdmin } = require("./helpers");
const { Ingredient, Supplier, Purchase } = require("../../Restaurant_POS_System/pos-backend/models/inventoryModel");

describe("Phase 3 supplier intelligence", () => {
  test("Admin receives ingredient supplier cost comparisons", async () => {
    const { cookie } = await loginAsAdmin();
    const ingredient = await Ingredient.create({ name: `Quoted Rice ${Date.now()}`, unit: "kg", stock: 2, reorderLevel: 5 });
    const supplier = await Supplier.create({ name: `Supplier ${Date.now()}` });
    await Purchase.create({ supplier: supplier._id, lines: [{ ingredient: ingredient._id, quantity: 10, unitCost: 42 }] });
    const response = await request(app).get("/api/inventory/supplier-intelligence").set("Cookie", cookie);
    expect(response.status).toBe(200);
    const item = response.body.data.items.find((entry) => entry.ingredientName.startsWith("Quoted Rice"));
    expect(item.lowestCost).toBe(42);
    expect(item.quotes[0].supplier).toContain("Supplier");
  });
});
