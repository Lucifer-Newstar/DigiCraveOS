const Order = require("../../Restaurant_POS_System/pos-backend/models/orderModel");
const Customer = require("../../Restaurant_POS_System/pos-backend/models/customerModel");
const { Purchase } = require("../../Restaurant_POS_System/pos-backend/models/inventoryModel");
const { Reservation } = require("../../Restaurant_POS_System/pos-backend/models/reservationModel");
const Shift = require("../../Restaurant_POS_System/pos-backend/models/shiftModel");
const Dish = require("../../Restaurant_POS_System/pos-backend/models/dishModel");

describe("Phase 4 database indexes", () => {
  test("high-volume listing models declare operational sort indexes", () => {
    const orderIndexes = Order.schema.indexes().map(([fields]) => Object.keys(fields).join(","));
    const customerIndexes = Customer.schema.indexes().map(([fields]) => Object.keys(fields).join(","));
    const purchaseIndexes = Purchase.schema.indexes().map(([fields]) => Object.keys(fields).join(","));
    const reservationIndexes = Reservation.schema.indexes().map(([fields]) => Object.keys(fields).join(","));
    const shiftIndexes = Shift.schema.indexes().map(([fields]) => Object.keys(fields).join(","));
    const dishIndexes = Dish.schema.indexes().map(([fields]) => Object.keys(fields).join(","));
    expect(orderIndexes).toContain("orderDate");
    expect(customerIndexes).toContain("lastVisit");
    expect(purchaseIndexes).toContain("receivedAt");
    expect(reservationIndexes).toContain("date,time,status");
    expect(shiftIndexes).toContain("startedAt");
    expect(Shift.schema.indexes().some(([fields, options]) => Object.keys(fields).join(",") === "staff" && options.unique && options.partialFilterExpression?.status === "Open")).toBe(true);
    expect(dishIndexes).toContain("category,isAvailable");
  });
});
