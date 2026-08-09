import { createSlice } from "@reduxjs/toolkit";

// Persist the authenticated user so a full page refresh doesn't blank the app
// while the session is re-validated against the server. The httpOnly auth
// cookie remains the source of truth; this is only a UX cache.
const STORAGE_KEY = "pos_user";

const loadPersisted = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const persisted = loadPersisted();

const initialState = persisted || {
  _id: "",
  name: "",
  email: "",
  phone: "",
  role: "",
  isAuth: false,
};

const persist = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { _id, name, phone, email, role } = action.payload;
      state._id = _id;
      state.name = name;
      state.phone = phone;
      state.email = email;
      state.role = role;
      state.isAuth = true;
      persist(state);
    },

    removeUser: (state) => {
      state._id = "";
      state.email = "";
      state.name = "";
      state.phone = "";
      state.role = "";
      state.isAuth = false;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    },
  },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
