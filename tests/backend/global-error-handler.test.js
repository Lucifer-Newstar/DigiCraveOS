const globalErrorHandler = require("../../Restaurant_POS_System/pos-backend/middlewares/globalErrorHandler");

describe("Phase 7 structured global errors", () => {
  test("returns stable fields and preserves request correlation", () => {
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })) };
    globalErrorHandler({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid input", stack: "stack" }, { requestId: "req-123" }, res);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ status: 422, code: "VALIDATION_ERROR", message: "Invalid input", requestId: "req-123" }));
    expect(json.mock.calls[0][0].timestamp).toEqual(expect.any(String));
  });

  test("redacts sensitive values from error messages", () => {
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })) };
    globalErrorHandler({ statusCode: 400, message: "token=abc123 password=hunter2" }, { requestId: "req-789" }, res);
    expect(json.mock.calls[0][0].message).toBe("token=[REDACTED] password=[REDACTED]");
  });

  test("uses a safe default code for unknown errors", () => {
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })) };
    globalErrorHandler(new Error("failure"), { requestId: "req-456" }, res);
    expect(json.mock.calls[0][0].code).toBe("INTERNAL_ERROR");
  });
});
