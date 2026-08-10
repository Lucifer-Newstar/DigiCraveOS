const { app, request, loginAsAdmin } = require("./helpers");

const kitchenUser = {
  name: "Test Kitchen",
  email: `kitchen_${Date.now()}@test.com`,
  phone: "8888888888",
  password: "pass1234",
  role: "Kitchen",
};

async function loginAsKitchen() {
  await request(app).post("/api/user/register").send(kitchenUser);
  const res = await request(app)
    .post("/api/user/login")
    .send({ email: kitchenUser.email, password: kitchenUser.password });
  return res.headers["set-cookie"];
}

async function createKitchenOrder(cookie) {
  const res = await request(app)
    .post("/api/order")
    .set("Cookie", cookie)
    .send({
      customerDetails: { name: "Kitchen Guest", phone: "7777777777", guests: 1 },
      items: [
        { name: "Butter Chicken", price: 250, quantity: 1, station: "Main", notes: "Less spicy" },
        { name: "Naan", price: 60, quantity: 2, station: "Tandoor" },
      ],
      bills: { total: 370, tax: 18.5, totalWithTax: 388.5 },
      orderType: "Dine In",
    });
  return res.body.data;
}

describe("Kitchen tickets (Phase 2 KOT/KDS)", () => {
  test("Kitchen role can read active tickets grouped by station", async () => {
    const { cookie: adminCookie } = await loginAsAdmin();
    await createKitchenOrder(adminCookie);
    const kitchenCookie = await loginAsKitchen();

    const res = await request(app)
      .get("/api/order/kitchen")
      .set("Cookie", kitchenCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.map((ticket) => ticket.station).sort()).toEqual(["Main", "Tandoor"]);
    expect(res.body.data[0].items[0].kitchenStatus).toBe("Pending");
  });

  test("Kitchen role can move an item from Pending to Preparing to Ready", async () => {
    const { cookie: adminCookie } = await loginAsAdmin();
    const order = await createKitchenOrder(adminCookie);
    const kitchenCookie = await loginAsKitchen();

    const preparing = await request(app)
      .patch(`/api/order/${order._id}/kitchen`)
      .set("Cookie", kitchenCookie)
      .send({ itemIndex: 0, kitchenStatus: "Preparing" });
    expect(preparing.status).toBe(200);

    const ready = await request(app)
      .patch(`/api/order/${order._id}/kitchen`)
      .set("Cookie", kitchenCookie)
      .send({ itemIndex: 0, kitchenStatus: "Ready" });
    expect(ready.status).toBe(200);
    expect(ready.body.data.items[0].kitchenStatus).toBe("Ready");
  });

  test("Kitchen cannot skip a ticket state", async () => {
    const { cookie: adminCookie } = await loginAsAdmin();
    const order = await createKitchenOrder(adminCookie);
    const kitchenCookie = await loginAsKitchen();

    const res = await request(app)
      .patch(`/api/order/${order._id}/kitchen`)
      .set("Cookie", kitchenCookie)
      .send({ itemIndex: 0, kitchenStatus: "Ready" });

    expect(res.status).toBe(409);
  });

  test("Kitchen role can continue the existing order lifecycle", async () => {
    const { cookie: adminCookie } = await loginAsAdmin();
    const order = await createKitchenOrder(adminCookie);
    const kitchenCookie = await loginAsKitchen();

    const res = await request(app)
      .put(`/api/order/${order._id}`)
      .set("Cookie", kitchenCookie)
      .send({ orderStatus: "Ready" });

    expect(res.status).toBe(200);
  });
});
