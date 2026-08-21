const { app, request, loginAsAdmin } = require("./helpers");
const User = require("../../Restaurant_POS_System/pos-backend/models/userModel");
const Shift = require("../../Restaurant_POS_System/pos-backend/models/shiftModel");

describe("Phase 3 workforce intelligence", () => {
  test("Admin receives open-shift liability by role", async () => {
    const { cookie } = await loginAsAdmin();
    const staff = await User.create({ name: "Open Staff", email: `open_${Date.now()}@test.com`, phone: "7000000001", password: "hashed", role: "Waiter" });
    await Shift.create({ staff: staff._id, startedAt: new Date(Date.now() - 60 * 60000), hourlyRate: 100, status: "Open" });
    const response = await request(app).get("/api/workforce/intelligence").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.openShifts).toBeGreaterThanOrEqual(1);
    expect(response.body.data.byRole.Waiter).toBeGreaterThanOrEqual(1);
    expect(response.body.data.estimatedLiability).toBeGreaterThanOrEqual(100);
  });
});
