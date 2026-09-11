const { measureQuery } = require("../../Restaurant_POS_System/pos-backend/utils/slowQuery");

describe("Phase 6 slow-query measurement", () => {
  test("logs structured diagnostics when the configured threshold is reached", async () => {
    const originalWarn = console.warn;
    console.warn = jest.fn();
    const clock = jest.spyOn(Date, "now").mockReturnValueOnce(0).mockReturnValueOnce(600);
    try {
      await measureQuery("test.query", async () => "ok");
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn.mock.calls[0][0]).toContain("slow_query");
    } finally {
      clock.mockRestore();
      console.warn = originalWarn;
    }
  });
});
