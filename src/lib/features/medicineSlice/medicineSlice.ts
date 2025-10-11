import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchMedicinesAllList } from "@/lib/api/medicine";
import { Medicine, MedicineResponse } from "@/types/medicine";

interface MedicineState {
  medicines: Medicine[];
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: MedicineState = {
  medicines: [],
  count: 0,
  loading: false,
  error: null,
};

// ✅ Get all medicines List
export const getMedicinesList = createAsyncThunk<
  MedicineResponse, // ✅ returning full object
  void,
  { rejectValue: string }
>("medicine/getAllList", async (_, { rejectWithValue }) => {
  try {
    const res: MedicineResponse = await fetchMedicinesAllList();
    return res; // ✅ return full response (includes success, count, data)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch medicines");
  }
});

const medicineSlice = createSlice({
  name: "medicine",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMedicinesList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMedicinesList.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines = action.payload.data;
        state.count = action.payload.count;
        state.error = null;
      })
      .addCase(getMedicinesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default medicineSlice.reducer;
