import { createSlice } from "@reduxjs/toolkit";

// Cart for the Guest (Customer) portal — kept separate from the staff POS cart.
const guestCartSlice = createSlice({
  name: "guestCart",
  initialState: [],
  reducers: {
    addGuestItem: (state, action) => {
      const dish = action.payload;
      const existing = state.find((i) => i.id === dish.id);
      if (existing) {
        existing.quantity += 1;
        existing.price = existing.pricePerQuantity * existing.quantity;
      } else {
        state.push({
          id: dish.id,
          name: dish.name,
          pricePerQuantity: dish.price,
          quantity: 1,
          price: dish.price,
        });
      }
    },
    incGuestItem: (state, action) => {
      const it = state.find((i) => i.id === action.payload);
      if (it) {
        it.quantity += 1;
        it.price = it.pricePerQuantity * it.quantity;
      }
    },
    decGuestItem: (state, action) => {
      const it = state.find((i) => i.id === action.payload);
      if (it && it.quantity > 1) {
        it.quantity -= 1;
        it.price = it.pricePerQuantity * it.quantity;
      }
    },
    removeGuestItem: (state, action) =>
      state.filter((i) => i.id !== action.payload),
    clearGuestCart: () => [],
  },
});

export const guestCartTotal = (state) =>
  state.guestCart.reduce((t, i) => t + i.price, 0);
export const guestCartCount = (state) =>
  state.guestCart.reduce((t, i) => t + i.quantity, 0);
export const {
  addGuestItem,
  incGuestItem,
  decGuestItem,
  removeGuestItem,
  clearGuestCart,
} = guestCartSlice.actions;
export default guestCartSlice.reducer;
