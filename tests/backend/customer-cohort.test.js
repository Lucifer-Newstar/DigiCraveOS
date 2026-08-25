const { app, request, loginAsAdmin } = require("./helpers");
const Customer = require("../../Restaurant_POS_System/pos-backend/models/customerModel");

describe("Phase 3 customer cohorts", () => {
  test("Admin receives monthly customer cohort summaries", async () => {
    const { cookie } = await loginAsAdmin();
    await Customer.create({ name: "January Cohort", phone: "7111111111", createdAt: new Date("2026-01-10"), totalOrders: 3, totalSpent: 900 });
    await Customer.create({ name: "January Cohort Two", phone: "7222222222", createdAt: new Date("2026-01-20"), totalOrders: 1, totalSpent: 200 });
    const response = await request(app).get("/api/customer/cohorts").set("Cookie", cookie);
    expect(response.status).toBe(200);
    const cohort = response.body.data.cohorts.find((entry) => entry.cohort === "2026-01");
    expect(cohort.customers).toBe(2);
    expect(cohort.orders).toBe(4);
    expect(cohort.revenue).toBe(1100);
    expect(cohort.averageSpend).toBe(550);
  });
});
