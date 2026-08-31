const { app, request, loginAsAdmin } = require("./helpers");
const { Ingredient } = require("../../Restaurant_POS_System/pos-backend/models/inventoryModel");

describe("Phase 4 inventory pagination", () => {
  test("Admin receives bounded ingredient pages and metadata", async () => {
    const { cookie } = await loginAsAdmin();
    const suffix = Date.now();
    await Ingredient.create([
      { name: `Page Ingredient A ${suffix}`, unit: "kg", stock: 1 },
      { name: `Page Ingredient B ${suffix}`, unit: "kg", stock: 1 },
      { name: `Page Ingredient C ${suffix}`, unit: "kg", stock: 1 },
    ]);
    const response = await request(app).get("/api/inventory?page=2&limit=1").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.ingredients).toHaveLength(1);
    expect(response.body.data.pagination.page).toBe(2);
    expect(response.body.data.pagination.limit).toBe(1);
    expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(3);
  });
});
