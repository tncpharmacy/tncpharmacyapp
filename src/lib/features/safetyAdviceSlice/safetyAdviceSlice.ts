import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchSafetyAdviceById,
  saveSafetyAdviceApi,
  fetchSafetyAdvice,
} from "@/lib/api/safetyAdvice";

import { SafetyAdvice, SafetyLabel } from "@/types/safetyAdvice";
import { MedicineSafety } from "@/types/medicine";
import { mapSafetyAdviceToMedicineSafety } from "@/mappers/safety.mapper";

interface SafetyAdviceState {
  entity: SafetyAdvice | null; // get by id
  labelList: SafetyLabel[]; // dropdown master
  medicineSafety: MedicineSafety | null;
  loading: boolean;
  error: string | null;
}

const initialState: SafetyAdviceState = {
  entity: null,
  labelList: [],
  medicineSafety: null,
  loading: false,
  error: null,
};

// List
export const fetchSafetyLabelListThunk = createAsyncThunk<
  SafetyLabel[],
  void,
  { rejectValue: string }
>("safetyAdvice/fetchLabels", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchSafetyAdvice();
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// By Id
export const fetchSafetyAdviceByIdThunk = createAsyncThunk<
  SafetyAdvice,
  number,
  { rejectValue: string }
>("safetyAdvice/fetchById", async (medicineId, { rejectWithValue }) => {
  try {
    const res = await fetchSafetyAdviceById(medicineId);
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// Create
export const saveSafetyAdviceThunk = createAsyncThunk<
  SafetyAdvice,
  MedicineSafety,
  { rejectValue: string }
>("safetyAdvice/save", async (payload, { rejectWithValue }) => {
  try {
    const res = await saveSafetyAdviceApi(payload);
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

/* =========================
   SLICE
========================= */

const safetyAdviceSlice = createSlice({
  name: "safetyAdvice",
  initialState,
  reducers: {
    clearSafetyAdvice(state) {
      state.entity = null;
      state.medicineSafety = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ===== LABEL LIST =====
      .addCase(fetchSafetyLabelListThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSafetyLabelListThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.labelList = action.payload;
      })
      .addCase(fetchSafetyLabelListThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch safety labels";
      })

      // ===== BY ID =====
      .addCase(fetchSafetyAdviceByIdThunk.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.medicineSafety = mapSafetyAdviceToMedicineSafety(action.payload);
      })

      // ===== SAVE =====
      .addCase(saveSafetyAdviceThunk.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.medicineSafety = mapSafetyAdviceToMedicineSafety(action.payload);
      });
  },
});

export const { clearSafetyAdvice } = safetyAdviceSlice.actions;
export default safetyAdviceSlice.reducer;
