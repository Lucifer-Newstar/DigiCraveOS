const { app, request, loginAsAdmin } = require("./helpers");
const AuditEvent = require("../../Restaurant_POS_System/pos-backend/models/auditEventModel");

describe("Phase 5 admin activity summary", () => {
  test("Admin receives recent audit counts by action and resource", async () => {
    const { cookie } = await loginAsAdmin();
    await AuditEvent.create([
      { action: "UPDATE", resource: "campaign-draft" },
      { action: "UPDATE", resource: "campaign-draft" },
      { action: "EXPORT", resource: "orders-csv" },
    ]);
    const response = await request(app).get("/api/reports/admin-activity?days=7").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(3);
    expect(response.body.data.byAction).toEqual(expect.arrayContaining([{ action: "UPDATE", count: 2 }, { action: "EXPORT", count: 1 }]));
    expect(response.body.data.byResource).toEqual(expect.arrayContaining([{ resource: "campaign-draft", count: 2 }]));
  });
});
