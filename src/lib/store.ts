import { configureStore } from "@reduxjs/toolkit";
import doctorReducer from "./features/doctor/doctorSlice";

export const store = configureStore({
  reducer: {
    doctor: doctorReducer,
  },
});

// types for use in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
