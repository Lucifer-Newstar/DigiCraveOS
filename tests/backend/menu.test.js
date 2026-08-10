const { app, request, loginAsAdmin } = require("./helpers");

let cookie;

beforeAll(async () => {
  ({ cookie } = await loginAsAdmin());
});

describe("Menu management (categories & dishes)", () => {
  let categoryId;

  test("admin can create a category", async () => {
    const res = await request(app)
      .post("/api/menu/category")
      .set("Cookie", cookie)
      .send({ name: `Starters_${Date.now()}`, icon: "🍲", bgColor: "#b73e3e" });
    expect(res.status).toBe(201);
    expect(res.body.data._id).toBeDefined();
    categoryId = res.body.data._id;
  });

  test("duplicate category name returns 409", async () => {
    const name = `Dupe_${Date.now()}`;
    await request(app).post("/api/menu/category").set("Cookie", cookie).send({ name });
    const res = await request(app)
      .post("/api/menu/category")
      .set("Cookie", cookie)
      .send({ name });
    expect(res.status).toBe(409);
  });

  test("admin can create a dish under a category", async () => {
    const res = await request(app)
      .post("/api/menu/dish")
      .set("Cookie", cookie)
      .send({ name: "Paneer Tikka", price: 280, category: categoryId });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Paneer Tikka");
    expect(res.body.data.price).toBe(280);
  });

  test("dish with invalid category is rejected", async () => {
    const res = await request(app)
      .post("/api/menu/dish")
      .set("Cookie", cookie)
      .send({ name: "Bad", price: 100, category: "not-an-id" });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("grouped menu returns categories with nested items", async () => {
    const res = await request(app).get("/api/menu").set("Cookie", cookie);
    expect(res.status).toBe(200);
    const cat = res.body.data.find((c) => c._id === categoryId);
    expect(cat).toBeDefined();
    expect(cat.items.some((i) => i.name === "Paneer Tikka")).toBe(true);
  });
});
