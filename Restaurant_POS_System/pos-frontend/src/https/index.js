import { axiosWrapper } from "./axiosWrapper";
import { queueOrder } from "../utils/offlineQueue";

// API Endpoints

// Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user");
export const logout = () => axiosWrapper.post("/api/user/logout");

// Table Endpoints
export const addTable = (data) => axiosWrapper.post("/api/table/", data);
export const getTables = () => axiosWrapper.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);

// Payment Endpoints
export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment/verify-payment", data);

// Order Endpoints
const postOrderDirect = (data) => axiosWrapper.post("/api/order/", data);
export const addOrder = async (data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const queued = queueOrder(data);
    return { data: { success: true, queued: true, data: queued } };
  }
  try {
    return await postOrderDirect(data);
  } catch (error) {
    if (!error.response) {
      const queued = queueOrder(data);
      return { data: { success: true, queued: true, data: queued } };
    }
    throw error;
  }
};
export const getOrders = (params = {}) => { const query = new URLSearchParams(params).toString(); return axiosWrapper.get(`/api/order${query ? `?${query}` : ""}`); };
export const getKitchenTickets = (params = {}) => { const query = new URLSearchParams(params).toString(); return axiosWrapper.get(`/api/order/kitchen${query ? `?${query}` : ""}`); };
export const getKitchenIntelligence = () => axiosWrapper.get("/api/order/kitchen/intelligence");
export const getKitchenDelayRisk = () => axiosWrapper.get("/api/order/kitchen/delay-risk");
export const updateKitchenItem = ({ orderId, itemIndex, kitchenStatus }) =>
  axiosWrapper.patch(`/api/order/${orderId}/kitchen`, { itemIndex, kitchenStatus });
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });
export const syncOrders = (orders) => axiosWrapper.post("/api/order/sync", { orders });
export const getMetrics = () => axiosWrapper.get("/api/order/metrics");
export const getPopularDishes = () => axiosWrapper.get("/api/order/popular");
export const getPayments = (limit = 25) =>
  axiosWrapper.get(`/api/order/payments?limit=${limit}`);

// Phase 2 inventory and reservation endpoints
export const getInventory = (params = {}) => { const query = new URLSearchParams(params).toString(); return axiosWrapper.get(`/api/inventory${query ? `?${query}` : ""}`); };
export const getInventoryIntelligence = () => axiosWrapper.get("/api/inventory/intelligence");
export const getSupplierIntelligence = () => axiosWrapper.get("/api/inventory/supplier-intelligence");
export const getRecipeCostVariance = () => axiosWrapper.get("/api/inventory/recipe-variance");
export const getWasteAnomalies = () => axiosWrapper.get("/api/inventory/waste-anomalies");
export const addIngredient = (data) => axiosWrapper.post("/api/inventory/ingredient", data);
export const updateIngredient = ({ id, ...data }) => axiosWrapper.patch(`/api/inventory/ingredient/${id}`, data);
export const saveRecipe = (data) => axiosWrapper.put("/api/inventory/recipe", data);
export const addSupplier = (data) => axiosWrapper.post("/api/inventory/supplier", data);
export const addPurchase = (data) => axiosWrapper.post("/api/inventory/purchase", data);
export const getReservations = (params = {}) => { const query = new URLSearchParams(params).toString(); return axiosWrapper.get(`/api/reservations${query ? `?${query}` : ""}`); };
export const addReservation = (data) => axiosWrapper.post("/api/reservations", data);
export const updateReservation = ({ id, ...data }) => axiosWrapper.patch(`/api/reservations/${id}`, data);
export const getWaitlist = () => axiosWrapper.get("/api/reservations/waitlist");
export const addWaitlist = (data) => axiosWrapper.post("/api/reservations/waitlist", data);
export const updateWaitlist = ({ id, ...data }) => axiosWrapper.patch(`/api/reservations/waitlist/${id}`, data);
export const getShifts = (params = {}) => { const query = new URLSearchParams(params).toString(); return axiosWrapper.get(`/api/workforce${query ? `?${query}` : ""}`); };
export const getWorkforceSummary = () => axiosWrapper.get("/api/workforce/summary");
export const getWorkforceIntelligence = () => axiosWrapper.get("/api/workforce/intelligence");
export const startShift = (data) => axiosWrapper.post("/api/workforce", data);
export const closeShift = ({ id, ...data }) => axiosWrapper.patch(`/api/workforce/${id}/close`, data);
export const getFinanceReport = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axiosWrapper.get(`/api/reports/finance${query ? `?${query}` : ""}`);
};
export const getProfitReport = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axiosWrapper.get(`/api/reports/profit${query ? `?${query}` : ""}`);
};
export const getPricingRecommendations = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axiosWrapper.get(`/api/reports/pricing-recommendations${query ? `?${query}` : ""}`);
};
export const getOwnerBriefing = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axiosWrapper.get(`/api/reports/owner-briefing${query ? `?${query}` : ""}`);
};
export const getPaymentReconciliation = () => axiosWrapper.get("/api/reports/payment-reconciliation");
export const getFraudSignals = () => axiosWrapper.get("/api/reports/fraud-signals");
export const exportOrdersCsv = (params = {}) => { const query = new URLSearchParams(params).toString(); return axiosWrapper.get(`/api/reports/export/orders.csv?${query}`, { responseType: "blob" }); };
export const getAuditEvents = (params = {}) => { const query = new URLSearchParams(params).toString(); return axiosWrapper.get(`/api/reports/audit-events${query ? `?${query}` : ""}`); };
export const getAdminActivitySummary = (params = {}) => { const query = new URLSearchParams(params).toString(); return axiosWrapper.get(`/api/reports/admin-activity${query ? `?${query}` : ""}`); };
export const getBriefingAcknowledgements = () => axiosWrapper.get("/api/reports/owner-briefing/acknowledgements");
export const acknowledgeBriefing = (insightKey) => axiosWrapper.post("/api/reports/owner-briefing/acknowledgements", { insightKey });

// Customer (staff view) Endpoints
export const getCustomers = (params = {}) => { const query = new URLSearchParams(params).toString(); return axiosWrapper.get(`/api/customer${query ? `?${query}` : ""}`); };
export const getCustomerIntelligence = () => axiosWrapper.get("/api/customer/intelligence");
export const getCustomerCohorts = () => axiosWrapper.get("/api/customer/cohorts");
export const getRetentionRecommendations = () => axiosWrapper.get("/api/customer/retention");
export const getLoyaltyOpportunities = () => axiosWrapper.get("/api/customer/loyalty-opportunities");
export const getCampaignDrafts = () => axiosWrapper.get("/api/customer/campaign-drafts");
export const updateCampaignDraft = ({ id, ...data }) => axiosWrapper.patch(`/api/customer/campaign-drafts/${id}`, data);

// Customer (Guest) portal Endpoints — separate auth from staff.
export const customerRegister = (data) =>
  axiosWrapper.post("/api/customer/auth/register", data);
export const customerLogin = (data) =>
  axiosWrapper.post("/api/customer/auth/login", data);
export const customerLogout = () =>
  axiosWrapper.post("/api/customer/auth/logout");
export const getCustomerProfile = () =>
  axiosWrapper.get("/api/customer/auth/me");
export const getCustomerMenu = () => axiosWrapper.get("/api/customer/auth/menu");
export const getCustomerOrders = () =>
  axiosWrapper.get("/api/customer/auth/orders");
export const placeCustomerOrder = (data) =>
  axiosWrapper.post("/api/customer/auth/orders", data);
export const createCustomerPaymentOrder = (data) =>
  axiosWrapper.post("/api/customer/auth/payment/create-order", data);
export const verifyCustomerPayment = (data) =>
  axiosWrapper.post("/api/customer/auth/payment/verify", data);

// Menu Endpoints (categories + dishes, DB-backed)
export const getMenu = (params = {}) => { const query = new URLSearchParams(params).toString(); return axiosWrapper.get(`/api/menu${query ? `?${query}` : ""}`); };
export const getCategories = () => axiosWrapper.get("/api/menu/category");
export const addCategory = (data) => axiosWrapper.post("/api/menu/category", data);
export const deleteCategory = (id) =>
  axiosWrapper.delete(`/api/menu/category/${id}`);
export const getDishes = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return axiosWrapper.get(`/api/menu/dish${q ? `?${q}` : ""}`);
};
export const addDish = (data) => axiosWrapper.post("/api/menu/dish", data);
export const updateDish = ({ dishId, ...data }) =>
  axiosWrapper.put(`/api/menu/dish/${dishId}`, data);
export const deleteDish = (id) => axiosWrapper.delete(`/api/menu/dish/${id}`);

// ML Endpoints (proxied by the backend to the Restaurant_POS_ML service)
export const getMlHealth = () => axiosWrapper.get("/api/ml/health");
export const getSalesForecast = (horizonDays = 7) =>
  axiosWrapper.get(`/api/ml/forecast?horizon_days=${horizonDays}`);
export const getDishDemand = (params = {}) => {
  const q = new URLSearchParams();
  if (params.targetDate) q.set("target_date", params.targetDate);
  if (params.top) q.set("top", params.top);
  const qs = q.toString();
  return axiosWrapper.get(`/api/ml/demand${qs ? `?${qs}` : ""}`);
};
export const getMlPopular = (limit = 10) =>
  axiosWrapper.get(`/api/ml/popular?limit=${limit}`);
export const getDishRecommendations = (items = [], limit = 5) =>
  axiosWrapper.post("/api/ml/recommend", { items, limit });
