const { app, request } = require("./helpers");

describe("Phase 4 health endpoints", () => {
  test("liveness is available without authentication", async () => {
    const response = await request(app).get("/api/health/live");
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("ok");
    expect(response.body.data.service).toBe("pos-backend");
    expect(response.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/i);

    const supplied = await request(app).get("/api/health/live").set("X-Request-Id", "smoke-123");
    expect(supplied.headers["x-request-id"]).toBe("smoke-123");
  });

  test("readiness reports the connected test database", async () => {
    const response = await request(app).get("/api/health/ready");
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("ready");
    expect(response.body.data.checks.database).toBe("up");
  });
});
