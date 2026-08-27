const { app, request, loginAsAdmin } = require("./helpers");

describe("Phase 3 briefing acknowledgement", () => {
  test("Admin can acknowledge and retrieve an owner briefing insight", async () => {
    const { cookie } = await loginAsAdmin();
    const created = await request(app).post("/api/reports/owner-briefing/acknowledgements").set("Cookie", cookie).send({ insightKey: "low-stock:flour" });
    expect(created.status).toBe(201);
    expect(created.body.data.insightKey).toBe("low-stock:flour");
    const listed = await request(app).get("/api/reports/owner-briefing/acknowledgements").set("Cookie", cookie);
    expect(listed.status).toBe(200);
    expect(listed.body.data.acknowledgements).toHaveLength(1);
  });
});
