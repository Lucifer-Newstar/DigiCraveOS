const { app, request } = require("./helpers");

// Guest (Customer portal) auth + self-service.
const uniq = Date.now();
const GUEST = {
  name: "Test Guest",
  phone: `98${String(uniq).slice(-8)}`,
  email: `guest_${uniq}@test.com`,
  password: "guestpass",
};

describe("Customer (Guest) auth", () => {
  let cookie;

  test("register creates a guest account + sets customerToken", async () => {
    const res = await request(app)
      .post("/api/customer/auth/register")
      .send(GUEST);
    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe(GUEST.email);
    expect(res.headers["set-cookie"]).toBeDefined();
    cookie = res.headers["set-cookie"];
  });

  test("guest can browse the menu without auth", async () => {
    const res = await request(app).get("/api/customer/auth/menu");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("me returns the logged-in guest", async () => {
    const res = await request(app)
      .get("/api/customer/auth/me")
      .set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(GUEST.email);
  });

  test("guest token cannot access staff endpoints", async () => {
    // customerToken is not accepted by isVerifiedUser (needs accessToken).
    const res = await request(app).get("/api/order").set("Cookie", cookie);
    expect(res.status).toBeGreaterThanOrEqual(401);
    expect(res.status).toBeLessThan(500);
  });

  test("guest places own order with server-computed GST bill", async () => {
    const res = await request(app)
      .post("/api/customer/auth/orders")
      .set("Cookie", cookie)
      .send({
        items: [
          { name: "Butter Chicken", pricePerQuantity: 320, quantity: 2 },
          { name: "Butter Naan", pricePerQuantity: 60, quantity: 3 },
        ],
        guests: 2,
        orderType: "Pickup",
      });
    expect(res.status).toBe(201);
    // subtotal 820 -> +5% GST = 861
    expect(res.body.data.bills.totalWithTax).toBeCloseTo(861, 1);
    expect(res.body.data.placedBy).toBe("customer");
  });

  test("guest sees their own orders", async () => {
    const res = await request(app)
      .get("/api/customer/auth/orders")
      .set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test("login with wrong password fails", async () => {
    const res = await request(app)
      .post("/api/customer/auth/login")
      .send({ email: GUEST.email, password: "wrong" });
    expect(res.status).toBe(401);
  });

  test("login works with correct credentials", async () => {
    const res = await request(app)
      .post("/api/customer/auth/login")
      .send({ email: GUEST.email, password: GUEST.password });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
