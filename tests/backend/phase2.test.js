const { app, request, loginAsAdmin } = require("./helpers");

describe("Phase 2 inventory and reservations", () => {
  test("Admin can create and read an ingredient", async () => {
    const { cookie } = await loginAsAdmin();
    const created = await request(app)
      .post("/api/inventory/ingredient")
      .set("Cookie", cookie)
      .send({ name: `Tomato ${Date.now()}`, unit: "kg", stock: 10, reorderLevel: 2 });
    expect(created.status).toBe(201);
    expect(created.body.data.stock).toBe(10);

    const list = await request(app).get("/api/inventory").set("Cookie", cookie);
    expect(list.status).toBe(200);
    expect(list.body.data.ingredients.length).toBeGreaterThan(0);
  });

  test("Admin can create a reservation", async () => {
    const { cookie } = await loginAsAdmin();
    const response = await request(app)
      .post("/api/reservations")
      .set("Cookie", cookie)
      .send({ guestName: "Reservation Guest", phone: "6666666666", date: "2026-09-20", time: "19:00", partySize: 4 });
    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe("Pending");
  });

  test("Reservations reject duplicate active slots for the same table", async () => {
    const { cookie } = await loginAsAdmin();
    const payload = { guestName: "Slot Guest", phone: "5555555555", date: "2026-09-21", time: "20:00", partySize: 2 };
    expect((await request(app).post("/api/reservations").set("Cookie", cookie).send(payload)).status).toBe(409);
    expect((await request(app).post("/api/reservations").set("Cookie", cookie).send(payload)).status).toBe(201);
  });

  test("Unauthenticated users cannot access inventory", async () => {
    const response = await request(app).get("/api/inventory");
    expect(response.status).toBe(401);
  });
});
