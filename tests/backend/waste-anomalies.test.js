const { app, request, loginAsAdmin } = require("./helpers");
const { Ingredient } = require("../../Restaurant_POS_System/pos-backend/models/inventoryModel");

describe("Phase 3 waste and consumption anomalies", () => {
  test("Admin receives recent consumption anomalies against a baseline window", async () => {
    const { cookie } = await loginAsAdmin();
    const now = Date.now();
    const ingredient = await Ingredient.create({ name: `Anomaly Tomato ${now}`, unit: "kg", stock: 5, movements: [
      { type: "CONSUMPTION", quantity: 2, createdAt: new Date(now - 10 * 86400000) },
      { type: "CONSUMPTION", quantity: 2, createdAt: new Date(now - 8 * 86400000) },
      { type: "CONSUMPTION", quantity: 8, createdAt: new Date(now - 2 * 86400000) },
    ] });
    const response = await request(app).get("/api/inventory/waste-anomalies?days=7").set("Cookie", cookie);
    expect(response.status).toBe(200);
    const item = response.body.data.items.find((entry) => entry.ingredientName.startsWith("Anomaly Tomato"));
    expect(item.status).toBe("anomaly");
    expect(item.recentQuantity).toBe(8);
    expect(response.body.data.anomalies).toBeGreaterThanOrEqual(1);
  });
});
