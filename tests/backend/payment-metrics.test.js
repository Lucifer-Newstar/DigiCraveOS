const crypto = require("crypto");
const { app, request, loginAsAdmin } = require("./helpers");

let cookie;
let tableId;

beforeAll(async () => {
  ({ cookie } = await loginAsAdmin());
  const t = await request(app)
    .post("/api/table")
    .set("Cookie", cookie)
    .send({ tableNo: 700 + Math.floor(Math.random() * 100000), seats: 4 });
  tableId = t.body?.data?._id;

  // Seed a couple of orders so metrics/payments have data.
  for (let i = 0; i < 3; i++) {
    await request(app)
      .post("/api/order")
      .set("Cookie", cookie)
      .send({
        customerDetails: { name: `M${i}`, phone: `98000010${i}`, guests: 1 },
        bills: { total: 400, tax: 20, totalWithTax: 420, cgst: 10, sgst: 10 },
        items: [{ name: "X", price: 400, quantity: 1 }],
        table: tableId,
        paymentMethod: i % 2 ? "Online" : "Cash",
      });
  }
});

describe("Payment verification (UML U11)", () => {
  test("bad signature returns 400", async () => {
    const res = await request(app)
      .post("/api/payment/verify-payment")
      .set("Cookie", cookie)
      .send({ razorpay_order_id: "o1", razorpay_payment_id: "p1", razorpay_signature: "bad" });
    expect(res.status).toBe(400);
  });

  test("valid signature verifies and persists a Payment doc", async () => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const sig = crypto
      .createHmac("sha256", secret)
      .update("o1|p1")
      .digest("hex");
    const res = await request(app)
      .post("/api/payment/verify-payment")
      .set("Cookie", cookie)
      .send({
        razorpay_order_id: "o1",
        razorpay_payment_id: "p1",
        razorpay_signature: sig,
        amount: 525,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.payment).toBeTruthy();
  });
});

describe("Dashboard metrics & payments", () => {
  test("metrics include totals, revenue trend and status breakdown", async () => {
    const res = await request(app).get("/api/order/metrics").set("Cookie", cookie);
    expect(res.status).toBe(200);
    const d = res.body.data;
    expect(typeof d.totalRevenue).toBe("number");
    expect(Array.isArray(d.revenueTrend)).toBe(true);
    expect(Array.isArray(d.statusBreakdown)).toBe(true);
  });

  test("payments endpoint returns summary, byMethod and rows", async () => {
    const res = await request(app).get("/api/order/payments").set("Cookie", cookie);
    expect(res.status).toBe(200);
    const d = res.body.data;
    expect(d.summary).toBeDefined();
    expect(Array.isArray(d.byMethod)).toBe(true);
    expect(Array.isArray(d.payments)).toBe(true);
  });
});
