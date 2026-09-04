const rateLimit = require("../../Restaurant_POS_System/pos-backend/middlewares/rateLimit");

describe("Phase 5 rate limiting", () => {
  afterEach(() => rateLimit.reset());

  test("allows requests within a window and rejects the next request", () => {
    const middleware = rateLimit({ windowMs: 60_000, max: 2, keyGenerator: () => "test-client" });
    const makeResponse = () => ({ set: jest.fn() });
    const next = jest.fn();
    middleware({ path: "/test", ip: "127.0.0.1" }, makeResponse(), next);
    middleware({ path: "/test", ip: "127.0.0.1" }, makeResponse(), next);
    middleware({ path: "/test", ip: "127.0.0.1" }, makeResponse(), next);
    expect(next).toHaveBeenCalledTimes(3);
    expect(next.mock.calls[2][0].statusCode).toBe(429);
  });

  test("tracks separate paths independently", () => {
    const middleware = rateLimit({ windowMs: 60_000, max: 1, keyGenerator: () => "test-client" });
    const next = jest.fn();
    middleware({ path: "/one", ip: "127.0.0.1" }, { set: jest.fn() }, next);
    middleware({ path: "/two", ip: "127.0.0.1" }, { set: jest.fn() }, next);
    expect(next.mock.calls.every(([error]) => !error)).toBe(true);
  });
});
