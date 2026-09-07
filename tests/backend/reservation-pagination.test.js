const { app, request, loginAsAdmin } = require("./helpers");
const { Reservation } = require("../../Restaurant_POS_System/pos-backend/models/reservationModel");

describe("Phase 5 reservation pagination", () => {
  test("Staff receives bounded reservation pages and metadata", async () => {
    const { cookie } = await loginAsAdmin();
    await Reservation.create([
      { guestName: "Page Reservation A", phone: "7888800001", date: "2026-10-01", time: "18:00", partySize: 2 },
      { guestName: "Page Reservation B", phone: "7888800002", date: "2026-10-02", time: "18:00", partySize: 2 },
    ]);
    const response = await request(app).get("/api/reservations?page=2&limit=1").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.limit).toBe(1);
    expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);
  });
});
