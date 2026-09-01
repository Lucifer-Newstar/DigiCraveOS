const Order = require("../../Restaurant_POS_System/pos-backend/models/orderModel");
const Customer = require("../../Restaurant_POS_System/pos-backend/models/customerModel");
const { Purchase } = require("../../Restaurant_POS_System/pos-backend/models/inventoryModel");

describe("Phase 4 database indexes", () => {
  test("high-volume listing models declare operational sort indexes", () => {
    const orderIndexes = Order.schema.indexes().map(([fields]) => Object.keys(fields).join(","));
    const customerIndexes = Customer.schema.indexes().map(([fields]) => Object.keys(fields).join(","));
    const purchaseIndexes = Purchase.schema.indexes().map(([fields]) => Object.keys(fields).join(","));
    expect(orderIndexes).toContain("orderDate");
    expect(customerIndexes).toContain("lastVisit");
    expect(purchaseIndexes).toContain("receivedAt");
  });
});
