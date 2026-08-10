import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const cartSlice = createSlice({
    name : "cart",
    initialState,
    reducers : {
        addItems : (state, action) => {
            state.push(action.payload);
        },

        removeItem: (state, action) => {
            return state.filter(item => item.id != action.payload);
        },

        incrementItem: (state, action) => {
            const item = state.find(i => i.id == action.payload);
            if (item) {
                item.quantity += 1;
                item.price = item.pricePerQuantity * item.quantity;
            }
        },

        decrementItem: (state, action) => {
            const item = state.find(i => i.id == action.payload);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                item.price = item.pricePerQuantity * item.quantity;
            }
        },

        // Per-line special instructions (maps to OrderItem.notes in UML U03).
        updateItemNotes: (state, action) => {
            const { id, notes } = action.payload;
            const item = state.find(i => i.id == id);
            if (item) item.notes = notes;
        },

        removeAllItems: (state) => {
            return [];
        }
    }
})

export const getTotalPrice = (state) => state.cart.reduce((total, item) => total + item.price, 0);
export const { addItems, removeItem, incrementItem, decrementItem, updateItemNotes, removeAllItems } = cartSlice.actions;
export default cartSlice.reducer;