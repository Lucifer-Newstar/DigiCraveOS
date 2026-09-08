const { app, request, loginAsAdmin } = require("./helpers");

describe("Phase 5 kitchen ticket pagination", () => {
  test("Kitchen users receive bounded ticket pages and metadata", async () => {
    const { cookie } = await loginAsAdmin();
    for (const name of ["Page Kitchen A", "Page Kitchen B"]) {
      await request(app).post("/api/order").set("Cookie", cookie).send({ customerDetails: { name, phone: `7999${Date.now() % 1000000}`, guests: 1 }, items: [{ name: "Ticket Dish", price: 50, quantity: 1, station: name }], bills: { total: 50, tax: 0, totalWithTax: 50 } });
    }
    const response = await request(app).get("/api/order/kitchen?page=2&limit=1").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);
  });
});
