const { app, request, ADMIN } = require("./helpers");

describe("Health & Auth", () => {
  test("GET / returns server hello", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/POS Server/i);
  });

  test("register + login sets an auth cookie", async () => {
    await request(app).post("/api/user/register").send(ADMIN);
    const res = await request(app)
      .post("/api/user/login")
      .send({ email: ADMIN.email, password: ADMIN.password });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("protected route rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/order");
    expect(res.status).toBe(401);
  });

  test("login with wrong password fails", async () => {
    await request(app).post("/api/user/register").send(ADMIN);
    const res = await request(app)
      .post("/api/user/login")
      .send({ email: ADMIN.email, password: "wrongpass" });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
