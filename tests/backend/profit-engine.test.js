const { app, request, loginAsAdmin } = require("./helpers");
const Dish = require("../../Restaurant_POS_System/pos-backend/models/dishModel");
const Category = require("../../Restaurant_POS_System/pos-backend/models/categoryModel");
const Order = require("../../Restaurant_POS_System/pos-backend/models/orderModel");
const { Ingredient, Recipe } = require("../../Restaurant_POS_System/pos-backend/models/inventoryModel");

describe("Phase 3 profit engine", () => {
  test("Admin receives recipe-based margin analysis and excludes voided orders", async () => {
    const { cookie } = await loginAsAdmin();
    const ingredient = await Ingredient.create({ name: `Profit Flour ${Date.now()}`, unit: "kg", stock: 10, batches: [{ quantity: 10, unitCost: 20 }] });
    const category = await Category.create({ name: `Profit Category ${Date.now()}` });
    const dish = await Dish.create({ name: `Profit Dish ${Date.now()}`, price: 100, category: category._id, isAvailable: true });
    await Recipe.create({ dish: dish._id, ingredients: [{ ingredient: ingredient._id, quantity: 2 }] });
    await Order.create({ customerDetails: { name: "Profit Guest", phone: "7777777777", guests: 1 }, orderStatus: "Paid", orderDate: new Date(), bills: { total: 100, tax: 5, totalWithTax: 105 }, items: [{ id: dish._id, name: dish.name, price: 100, quantity: 1 }] });
    await Order.create({ customerDetails: { name: "Voided Guest", phone: "7888888888", guests: 1 }, orderStatus: "Voided", orderDate: new Date(), bills: { total: 100, tax: 5, totalWithTax: 105 }, items: [{ id: dish._id, name: dish.name, price: 100, quantity: 1 }] });

    const response = await request(app).get("/api/reports/profit").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.summary.revenue).toBe(100);
    expect(response.body.data.summary.foodCost).toBe(40);
    expect(response.body.data.summary.grossProfit).toBe(60);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].status).toBe("high_margin");

    const pricing = await request(app).get("/api/reports/pricing-recommendations?targetMargin=70").set("Cookie", cookie);
    expect(pricing.status).toBe(200);
    expect(pricing.body.data.items[0].status).toBe("review_price");
    expect(pricing.body.data.items[0].suggestedPrice).toBeCloseTo(133.33, 2);
  });
});
