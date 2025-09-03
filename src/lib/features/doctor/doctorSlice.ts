import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Doctor = {
  id: number;
  doctorId: string;
  doctorName: string;
  gender: string;
  specialization: string;
  mobile: string;
  email: string;
  experience: number; // in years
  status: number;
};

type DoctorState = {
  list: Doctor[];
};

const initialState: DoctorState = {
  list: [],
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    addDoctor: (state, action: PayloadAction<Doctor>) => {
      state.list.push(action.payload);
    },
    removeDoctor: (state, action: PayloadAction<number>) => {
      state.list = state.list.filter((doc) => doc.id !== action.payload);
    },
    clearDoctors: (state) => {
      state.list = [];
    },
  },
});

export const { addDoctor, removeDoctor, clearDoctors } = doctorSlice.actions;
export default doctorSlice.reducer;
