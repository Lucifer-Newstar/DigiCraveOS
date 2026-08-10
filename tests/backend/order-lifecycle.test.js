const { app, request, loginAsAdmin } = require("./helpers");

let cookie;
let tableId;

const baseOrder = (overrides = {}) => ({
  customerDetails: { name: "Jest Cust", phone: "9800000000", guests: 2 },
  bills: { total: 900, tax: 45, totalWithTax: 945, cgst: 22.5, sgst: 22.5 },
  items: [
    { name: "A", price: 300, quantity: 1 },
    { name: "B", price: 300, quantity: 1 },
    { name: "C", price: 300, quantity: 1 },
  ],
  table: tableId,
  paymentMethod: "Cash",
  ...overrides,
});

beforeAll(async () => {
  ({ cookie } = await loginAsAdmin());
  const t = await request(app)
    .post("/api/table")
    .set("Cookie", cookie)
    .send({ tableNo: 500 + Math.floor(Math.random() * 100000), seats: 4 });
  tableId = t.body?.data?._id;
});

async function createOrder(overrides) {
  const res = await request(app)
    .post("/api/order")
    .set("Cookie", cookie)
    .send(baseOrder(overrides));
  return res;
}

describe("Order status lifecycle (UML U10)", () => {
  test("cash order starts In Progress", async () => {
    const res = await createOrder();
    expect(res.status).toBe(201);
    expect(res.body.data.orderStatus).toBe("In Progress");
  });

  test("online-paid order enters as Paid", async () => {
    const res = await createOrder({
      paymentMethod: "Online",
      paymentData: { razorpay_order_id: "o_x", razorpay_payment_id: "p_x" },
    });
    expect(res.body.data.orderStatus).toBe("Paid");
  });

  test("valid transition In Progress -> Ready", async () => {
    const { body } = await createOrder();
    const res = await request(app)
      .put(`/api/order/${body.data._id}`)
      .set("Cookie", cookie)
      .send({ orderStatus: "Ready" });
    expect(res.status).toBe(200);
    expect(res.body.data.orderStatus).toBe("Ready");
  });

  test("illegal jump In Progress -> Completed returns 409", async () => {
    const { body } = await createOrder();
    const res = await request(app)
      .put(`/api/order/${body.data._id}`)
      .set("Cookie", cookie)
      .send({ orderStatus: "Completed" });
    expect(res.status).toBe(409);
  });

  test("invalid status value returns 400", async () => {
    const { body } = await createOrder();
    const res = await request(app)
      .put(`/api/order/${body.data._id}`)
      .set("Cookie", cookie)
      .send({ orderStatus: "Frozen" });
    expect(res.status).toBe(400);
  });

  test("full chain Ready -> Served -> Paid -> Completed", async () => {
    const { body } = await createOrder();
    const id = body.data._id;
    for (const s of ["Ready", "Served", "Paid", "Completed"]) {
      const res = await request(app)
        .put(`/api/order/${id}`)
        .set("Cookie", cookie)
        .send({ orderStatus: s });
      expect(res.status).toBe(200);
      expect(res.body.data.orderStatus).toBe(s);
    }
  });
});

describe("Order/Bill methods (UML U03)", () => {
  test("hold then resume returns to prior status", async () => {
    const { body } = await createOrder();
    const id = body.data._id;
    const held = await request(app)
      .post(`/api/order/${id}/hold`)
      .set("Cookie", cookie);
    expect(held.body.data.orderStatus).toBe("On Hold");
    const resumed = await request(app)
      .post(`/api/order/${id}/resume`)
      .set("Cookie", cookie);
    expect(resumed.body.data.orderStatus).toBe("In Progress");
  });

  test("split divides items into parts with recomputed GST bills", async () => {
    const { body } = await createOrder();
    const res = await request(app)
      .get(`/api/order/${body.data._id}/split?parts=2`)
      .set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    const totalItems = res.body.data.reduce((s, p) => s + p.items.length, 0);
    expect(totalItems).toBe(3);
    expect(res.body.data[0].bills.totalWithTax).toBeGreaterThan(0);
  });

  test("merge combines two orders' items", async () => {
    const a = await createOrder();
    const b = await createOrder({
      items: [{ name: "D", price: 200, quantity: 1 }],
    });
    const res = await request(app)
      .post("/api/order/merge")
      .set("Cookie", cookie)
      .send({ orderIds: [a.body.data._id, b.body.data._id] });
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(4);
  });

  test("order line items persist notes & station", async () => {
    const res = await createOrder({
      items: [
        { name: "Paneer Tikka", price: 250, quantity: 1, notes: "no onion", station: "Tandoor" },
      ],
    });
    const it = res.body.data.items[0];
    expect(it.notes).toBe("no onion");
    expect(it.station).toBe("Tandoor");
  });
});
