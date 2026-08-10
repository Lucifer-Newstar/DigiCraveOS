import { configureStore } from "@reduxjs/toolkit";
import customerSlice from "./slices/customerSlice";
import cartSlice from "./slices/cartSlice";
import userSlice from "./slices/userSlice";
import customerAuthSlice from "./slices/customerAuthSlice";
import guestCartSlice from "./slices/guestCartSlice";

const store = configureStore({
    reducer: {
        customer: customerSlice,
        cart : cartSlice,
        user : userSlice,
        customerAuth: customerAuthSlice,
        guestCart: guestCartSlice,
    },

    devTools: import.meta.env.MODE !== "production",
});

export default store;
