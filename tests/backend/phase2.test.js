const { app, request, loginAsAdmin } = require("./helpers");

describe("Phase 2 inventory and reservations", () => {
  test("Staff can replay idempotent offline orders through the sync endpoint", async () => {
    const { cookie } = await loginAsAdmin();
    const payload = { idempotencyKey: `offline-${Date.now()}`, customerDetails: { name: "Offline Guest", phone: "4444444444", guests: 1 }, items: [{ name: "Tea", price: 20, quantity: 1 }], bills: { total: 20, tax: 1, totalWithTax: 21 } };
    const first = await request(app).post("/api/order/sync").set("Cookie", cookie).send({ orders: [payload] });
    const second = await request(app).post("/api/order/sync").set("Cookie", cookie).send({ orders: [payload] });
    expect(first.status).toBe(200);
    expect(second.body.data[0].status).toBe("already_synced");
  });
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

  test("Admin can receive a purchase and expose inventory valuation", async () => {
    const { cookie } = await loginAsAdmin();
    const ingredient = await request(app)
      .post("/api/inventory/ingredient")
      .set("Cookie", cookie)
      .send({ name: `FIFO Flour ${Date.now()}`, unit: "kg", stock: 0, reorderLevel: 1 });
    const purchase = await request(app)
      .post("/api/inventory/purchase")
      .set("Cookie", cookie)
      .send({ lines: [{ ingredient: ingredient.body.data._id, quantity: 5, unitCost: 40 }] });
    expect(purchase.status).toBe(201);
    const inventory = await request(app).get("/api/inventory").set("Cookie", cookie);
    expect(inventory.body.data.valuation).toBeGreaterThanOrEqual(200);
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

  test("Reservations reject duplicate active slots", async () => {
    const { cookie } = await loginAsAdmin();
    const payload = { guestName: "Slot Guest", phone: "5555555555", date: "2026-09-21", time: "20:00", partySize: 2 };
    expect((await request(app).post("/api/reservations").set("Cookie", cookie).send(payload)).status).toBe(201);
    expect((await request(app).post("/api/reservations").set("Cookie", cookie).send(payload)).status).toBe(409);
  });

  test("Unauthenticated users cannot access inventory", async () => {
    const response = await request(app).get("/api/inventory");
    expect(response.status).toBe(401);
  });
});
