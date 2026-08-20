const { app, request, loginAsAdmin } = require("./helpers");
const { Ingredient } = require("../../Restaurant_POS_System/pos-backend/models/inventoryModel");

describe("Phase 3 inventory intelligence", () => {
  test("Admin receives low-stock purchase suggestions", async () => {
    const { cookie } = await loginAsAdmin();
    await Ingredient.create({ name: `Low Stock ${Date.now()}`, unit: "kg", stock: 2, reorderLevel: 5, batches: [{ quantity: 2, unitCost: 30 }] });
    const response = await request(app).get("/api/inventory/intelligence").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.lowStockCount).toBeGreaterThanOrEqual(1);
    const item = response.body.data.lowStock.find((entry) => entry.name.startsWith("Low Stock"));
    expect(item.shortage).toBe(3);
    expect(item.suggestedPurchase).toBe(8);
    expect(response.body.data.stockValue).toBeGreaterThanOrEqual(60);
  });
});
