const { app, request, loginAsAdmin } = require("./helpers");

describe("Phase 2 shifts and payroll", () => {
  test("Admin can start and close a staff shift", async () => {
    const { cookie } = await loginAsAdmin();
    const staff = await request(app).post("/api/user/register").send({ name: `Shift Staff ${Date.now()}`, email: `shift_${Date.now()}@test.com`, phone: `${Date.now()}`.slice(-10), password: "pass1234", role: "Cashier" });
    const started = await request(app).post("/api/workforce").set("Cookie", cookie).send({ staff: staff.body.data._id, hourlyRate: 120 });
    expect(started.status).toBe(201);
    const closed = await request(app).patch(`/api/workforce/${started.body.data._id}/close`).set("Cookie", cookie).send({ breakMinutes: 15 });
    expect(closed.status).toBe(200);
    expect(closed.body.data.status).toBe("Closed");
  });

  test("Admin cannot start a second open shift for the same staff member", async () => {
    const { cookie } = await loginAsAdmin();
    const staff = await request(app).post("/api/user/register").send({ name: `Open Staff ${Date.now()}`, email: `open_${Date.now()}@test.com`, phone: `${Date.now()}`.slice(-10), password: "pass1234", role: "Waiter" });
    const payload = { staff: staff.body.data._id, hourlyRate: 100 };
    expect((await request(app).post("/api/workforce").set("Cookie", cookie).send(payload)).status).toBe(201);
    expect((await request(app).post("/api/workforce").set("Cookie", cookie).send(payload)).status).toBe(409);
  });
});
