const { app, request, loginAsAdmin } = require("./helpers");
const AuditEvent = require("../../Restaurant_POS_System/pos-backend/models/auditEventModel");

describe("Phase 3 audit event search", () => {
  test("Admin can filter audit events by action and resource", async () => {
    const { cookie } = await loginAsAdmin();
    await AuditEvent.create({ action: "UPDATE", resource: "campaign", resourceId: "draft-1", metadata: { field: "subject" } });
    await AuditEvent.create({ action: "CREATE", resource: "ingredient", resourceId: "ingredient-1" });
    const response = await request(app).get("/api/reports/audit-events?action=UPDATE&resource=campaign").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(1);
    expect(response.body.data.events[0].metadata.field).toBe("subject");
  });

  test("Admin receives retention eligibility without destructive deletion", async () => {
    const { cookie } = await loginAsAdmin();
    await AuditEvent.create({ action: "OLD", resource: "test", createdAt: new Date(Date.now() - 120 * 86400000) });
    const response = await request(app).get("/api/reports/audit-events/retention?retainDays=90").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.eligibleCount).toBeGreaterThanOrEqual(1);
    expect(response.body.data.deletionRequired).toBe(true);
  });
});
