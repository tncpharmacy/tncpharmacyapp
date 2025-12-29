import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchDoseForm } from "@/lib/api/doseForm";
import { DoseFormResponse } from "@/types/doseForm";

/* =========================
   STATE
========================= */

interface DoseFormState {
  list: DoseFormResponse["data"];
  loading: boolean;
  error: string | null;
}

const initialState: DoseFormState = {
  list: [],
  loading: false,
  error: null,
};

/* =========================
   THUNK (NO RENAME)
========================= */

export const fetchDoseFormThunk = createAsyncThunk<
  DoseFormResponse["data"],
  void,
  { rejectValue: string }
>("doseForm/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchDoseForm();
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

/* =========================
   SLICE
========================= */

const doseFormSlice = createSlice({
  name: "doseForm",
  initialState,
  reducers: {
    clearDoseForm(state) {
      state.list = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoseFormThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoseFormThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchDoseFormThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch dose forms";
      });
  },
});

export const { clearDoseForm } = doseFormSlice.actions;
export default doseFormSlice.reducer;
