// src/lib/features/pharmaciesSlice/pharmaciesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchPharmacistApi,
  togglePharmacistStatusApi,
  createPharmacistApi,
  updatePharmacistApi,
} from "@/lib/api/pharmacistByPharmacy";
import { Pharmacist } from "@/types/pharmacist";

interface PharmacyState {
  list: Pharmacist[];
  loading: boolean;
  error: string | null;
}

const initialState: PharmacyState = {
  list: [],
  loading: false,
  error: null,
};

// 🔥 Fetch all pharmacies
export const fetchPharmacist = createAsyncThunk<
  Pharmacist[],
  void,
  { rejectValue: string }
>("pharmacist/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const list = await fetchPharmacistApi();
    return list;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Fetch failed");
  }
});

// toggle status thunk
export const togglePharmacistStatus = createAsyncThunk<
  Pharmacist,
  number,
  { rejectValue: string }
>("pharmacist/toggleStatus", async (id, { rejectWithValue }) => {
  try {
    const updated = await togglePharmacistStatusApi(id);
    return updated;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Status update failed");
  }
});

// // ✅ Add pharmacy thunk
export const addPharmacist = createAsyncThunk(
  "pharmacy/add",
  async (data: Partial<Pharmacist>, { rejectWithValue }) => {
    try {
      return await createPharmacistApi(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Data is not successfully added");
    }
  }
);

// ✅ Update pharmacy thunk
export const editPharmacist = createAsyncThunk(
  "pharmacy/edit",
  async (
    { id, data }: { id: number; data: Partial<Pharmacist> },
    { rejectWithValue }
  ) => {
    try {
      return await updatePharmacistApi(id, data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Data is not successfully updated");
    }
  }
);

const pharmacistByPharmacySlice = createSlice({
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
      .addCase(fetchPharmacist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPharmacist.fulfilled,
        (state, action: PayloadAction<Pharmacist[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(fetchPharmacist.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load pharmacies";
      })

      // ✅ status
      .addCase(togglePharmacistStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.list = state.list.map((p) =>
          p.id === updated.id ? { ...p, status: updated.status } : p
        );
      })
      .addCase(togglePharmacistStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePharmacistStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Status update failed";
      })
      // ✅ Add pharmacy
      .addCase(addPharmacist.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPharmacist.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(addPharmacist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Edit pharmacy
      .addCase(editPharmacist.pending, (state) => {
        state.loading = true;
      })
      .addCase(editPharmacist.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(editPharmacist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPharmacies } = pharmacistByPharmacySlice.actions;
export default pharmacistByPharmacySlice.reducer;
