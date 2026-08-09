import { axiosWrapper } from "./axiosWrapper";

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
export const addOrder = (data) => axiosWrapper.post("/api/order/", data);
export const getOrders = () => axiosWrapper.get("/api/order");
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });
export const getMetrics = () => axiosWrapper.get("/api/order/metrics");
export const getPopularDishes = () => axiosWrapper.get("/api/order/popular");
export const getPayments = (limit = 25) =>
  axiosWrapper.get(`/api/order/payments?limit=${limit}`);

// Customer Endpoints
export const getCustomers = () => axiosWrapper.get("/api/customer");

// Menu Endpoints (categories + dishes, DB-backed)
export const getMenu = () => axiosWrapper.get("/api/menu");
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
