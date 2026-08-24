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
    expect(item.latestCost).toBe(42);
    expect(item.quotes[0].supplier).toContain("Supplier");
  });

  test("Comparison keeps the lowest cost while exposing the latest quote", async () => {
    const { cookie } = await loginAsAdmin();
    const ingredient = await Ingredient.create({ name: `Price History ${Date.now()}`, unit: "litre", stock: 4, reorderLevel: 2 });
    const firstSupplier = await Supplier.create({ name: "Lower Cost Supplier" });
    const secondSupplier = await Supplier.create({ name: "Latest Supplier" });
    await Purchase.create({ supplier: firstSupplier._id, receivedAt: new Date("2026-01-01"), lines: [{ ingredient: ingredient._id, quantity: 5, unitCost: 35 }] });
    await Purchase.create({ supplier: secondSupplier._id, receivedAt: new Date("2026-02-01"), lines: [{ ingredient: ingredient._id, quantity: 5, unitCost: 48 }] });
    const response = await request(app).get("/api/inventory/supplier-intelligence").set("Cookie", cookie);
    const item = response.body.data.items.find((entry) => entry.ingredientName.startsWith("Price History"));
    expect(response.status).toBe(200);
    expect(item.lowestCost).toBe(35);
    expect(item.latestCost).toBe(48);
    expect(item.quotes).toHaveLength(2);
  });

  test("Ingredients without purchases remain visible with empty quote history", async () => {
    const { cookie } = await loginAsAdmin();
    const ingredient = await Ingredient.create({ name: `Never Purchased ${Date.now()}`, unit: "kg", stock: 1, reorderLevel: 1 });
    const response = await request(app).get("/api/inventory/supplier-intelligence").set("Cookie", cookie);
    const item = response.body.data.items.find((entry) => entry.ingredientName.startsWith("Never Purchased"));
    expect(response.status).toBe(200);
    expect(item.quotes).toEqual([]);
    expect(item.lowestCost).toBeNull();
    expect(item.latestCost).toBeNull();
  });
});
