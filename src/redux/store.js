import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/redux/reducers/authReducer";

const store = configureStore({
  reducer: {
    authReducer,
  },
});

export default store;