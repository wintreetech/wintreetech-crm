import { configureStore } from "@reduxjs/toolkit";
// Import slices
import authReducer from "./slices/Auth.slice.js";
import usersReducer from "./slices/Users.slice.js";
import salesReducer from "./slices/Sales.slice.js";

//Store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    sales: salesReducer,
  },
});

export default store;
