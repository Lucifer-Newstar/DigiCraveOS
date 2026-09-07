const { app, request, loginAsAdmin } = require("./helpers");

describe("Phase 5 workforce pagination", () => {
  test("Admin receives bounded shift pages and metadata", async () => {
    const { cookie } = await loginAsAdmin();
    const suffix = Date.now();
    const first = await request(app).post("/api/user/register").send({ name: `Page Staff A ${suffix}`, email: `page_a_${suffix}@test.com`, phone: `7999${String(suffix).slice(-6)}`, password: "pass1234", role: "Cashier" });
    const second = await request(app).post("/api/user/register").send({ name: `Page Staff B ${suffix}`, email: `page_b_${suffix}@test.com`, phone: `7888${String(suffix).slice(-6)}`, password: "pass1234", role: "Waiter" });
    await request(app).post("/api/workforce").set("Cookie", cookie).send({ staff: first.body.data._id, hourlyRate: 100 });
    await request(app).post("/api/workforce").set("Cookie", cookie).send({ staff: second.body.data._id, hourlyRate: 110 });
    const response = await request(app).get("/api/workforce?page=2&limit=1").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);
  });
});
