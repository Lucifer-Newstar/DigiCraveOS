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

        removeAllItems: (state) => {
            return [];
        }
    }
})

export const getTotalPrice = (state) => state.cart.reduce((total, item) => total + item.price, 0);
export const { addItems, removeItem, incrementItem, decrementItem, removeAllItems } = cartSlice.actions;
export default cartSlice.reducer;