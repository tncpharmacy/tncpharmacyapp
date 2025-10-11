import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchPharmacyListApi } from "@/lib/api/pharmacy";

export interface PharmacyListItem {
  id: number;
  pharmacy_name: string | null;
}

interface PharmacyListState {
  list: PharmacyListItem[];
  loading: boolean;
  error: string | null;
}

const initialState: PharmacyListState = {
  list: [],
  loading: false,
  error: null,
};

// ✅ Thunk to fetch pharmacy list
export const fetchPharmacyList = createAsyncThunk<
  PharmacyListItem[],
  void,
  { rejectValue: string }
>("pharmacyList/fetch", async (_, { rejectWithValue }) => {
  try {
    const data = await fetchPharmacyListApi();
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch pharmacy list");
  }
});

const pharmacyListSlice = createSlice({
  name: "pharmacyList",
  initialState,
  reducers: {
    clearPharmacyList(state) {
      state.list = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPharmacyList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPharmacyList.fulfilled,
        (state, action: PayloadAction<PharmacyListItem[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(fetchPharmacyList.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? "Failed to load pharmacy list";
      });
  },
});

export const { clearPharmacyList } = pharmacyListSlice.actions;
export default pharmacyListSlice.reducer;
