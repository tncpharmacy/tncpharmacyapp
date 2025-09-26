// src/lib/features/pharmaciesSlice/pharmaciesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchPharmaciesApi,
  togglePharmacyStatusApi,
  createPharmacyApi,
  updatePharmacyApi,
} from "@/lib/api/pharmacy";
import { Pharmacy, PharmacySuperAdminForm } from "@/types/pharmacy";

interface PharmacyState {
  list: Pharmacy[];
  loading: boolean;
  error: string | null;
}

const initialState: PharmacyState = {
  list: [],
  loading: false,
  error: null,
};

// 🔥 Fetch all pharmacies
export const fetchPharmacy = createAsyncThunk<
  Pharmacy[],
  void,
  { rejectValue: string }
>("pharmacies/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const list = await fetchPharmaciesApi();
    return list;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Fetch failed");
  }
});

// toggle status thunk
export const togglePharmacyStatus = createAsyncThunk<
  Pharmacy,
  number,
  { rejectValue: string }
>("pharmacies/toggleStatus", async (id, { rejectWithValue }) => {
  try {
    const updated = await togglePharmacyStatusApi(id);
    return updated;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Status update failed");
  }
});

// ✅ Add pharmacy thunk
export const addPharmacy = createAsyncThunk(
  "pharmacy/add",
  async (data: Partial<PharmacySuperAdminForm>, { rejectWithValue }) => {
    try {
      return await createPharmacyApi(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Data is not successfully added");
    }
  }
);

// ✅ Update pharmacy thunk
export const editPharmacy = createAsyncThunk(
  "pharmacy/edit",
  async (
    { id, data }: { id: number; data: Partial<PharmacySuperAdminForm> },
    { rejectWithValue }
  ) => {
    try {
      return await updatePharmacyApi(id, data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Data is not successfully updated");
    }
  }
);

const pharmacySlice = createSlice({
  name: "pharmacies",
  initialState,
  reducers: {
    clearPharmacies(state) {
      state.list = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ fetch
      .addCase(fetchPharmacy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPharmacy.fulfilled,
        (state, action: PayloadAction<Pharmacy[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(fetchPharmacy.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load pharmacies";
      })

      // ✅ status
      .addCase(togglePharmacyStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.list = state.list.map((p) =>
          p.id === updated.id ? { ...p, status: updated.status } : p
        );
      })
      .addCase(togglePharmacyStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePharmacyStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Status update failed";
      })
      // ✅ Add pharmacy
      .addCase(addPharmacy.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPharmacy.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(addPharmacy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Edit pharmacy
      .addCase(editPharmacy.pending, (state) => {
        state.loading = true;
      })
      .addCase(editPharmacy.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(editPharmacy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPharmacies } = pharmacySlice.actions;
export default pharmacySlice.reducer;
