const { app, request } = require("./helpers");

describe("Phase 5 API contracts", () => {
  test("unauthenticated protected requests expose stable error metadata", async () => {
    const response = await request(app).get("/api/inventory");
    expect(response.status).toBe(401);
    expect(response.body.status).toBe(401);
    expect(response.body.message).toBeDefined();
    expect(response.body.requestId).toBe(response.headers["x-request-id"]);
    expect(response.body.meta.requestId).toBe(response.headers["x-request-id"]);
  });

  test("unknown routes retain correlation headers and error shape", async () => {
    const response = await request(app).get("/api/does-not-exist");
    expect(response.headers["x-request-id"]).toBeDefined();
    expect(response.status).toBe(404);
  });
});
