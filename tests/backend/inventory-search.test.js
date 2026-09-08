const { app, request, loginAsAdmin } = require("./helpers");
const { Ingredient } = require("../../Restaurant_POS_System/pos-backend/models/inventoryModel");

describe("Phase 5 inventory search", () => {
  test("Admin can search ingredients by name", async () => {
    const { cookie } = await loginAsAdmin();
    const suffix = Date.now();
    await Ingredient.create({ name: `Search Basil ${suffix}`, unit: "kg", stock: 1 });
    await Ingredient.create({ name: `Other Flour ${suffix}`, unit: "kg", stock: 1 });
    const response = await request(app).get(`/api/inventory?search=basil&limit=100`).set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.ingredients.some((item) => item.name.startsWith("Search Basil"))).toBe(true);
    expect(response.body.data.ingredients.every((item) => item.name.toLowerCase().includes("basil"))).toBe(true);
  });
});
