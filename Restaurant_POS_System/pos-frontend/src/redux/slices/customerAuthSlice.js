import { createSlice } from "@reduxjs/toolkit";

// Persisted Guest (Customer portal) session — mirrors the staff userSlice
// pattern so refreshes don't blank the customer site.
const KEY = "pos_customer";

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState = load() || {
  _id: "",
  name: "",
  email: "",
  phone: "",
  totalOrders: 0,
  totalSpent: 0,
  isAuth: false,
};

const persist = (s) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
};

const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState,
  reducers: {
    setCustomer: (state, action) => {
      const { _id, name, email, phone, totalOrders, totalSpent } = action.payload;
      state._id = _id;
      state.name = name;
      state.email = email;
      state.phone = phone;
      state.totalOrders = totalOrders ?? state.totalOrders;
      state.totalSpent = totalSpent ?? state.totalSpent;
      state.isAuth = true;
      persist(state);
    },
    clearCustomer: (state) => {
      state._id = "";
      state.name = "";
      state.email = "";
      state.phone = "";
      state.totalOrders = 0;
      state.totalSpent = 0;
      state.isAuth = false;
      try {
        localStorage.removeItem(KEY);
      } catch {
        /* ignore */
      }
    },
  },
});

export const { setCustomer, clearCustomer } = customerAuthSlice.actions;
export default customerAuthSlice.reducer;
