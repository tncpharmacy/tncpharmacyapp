import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchHealthBag,
  createHealthBag,
  deleteHealthBag,
  fetchHealthBagAdmin,
  createHealthBagDTO,
} from "@/lib/api/healthBag";
import { HealthBag, HealthBagResponse } from "@/types/healthBag";

// ===============================
// STATE
// ===============================
interface HealthBagState {
  items: HealthBag[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: HealthBagState = {
  items: [],
  loading: false,
  error: null,
  message: null,
};

// ===============================
// ASYNC THUNKS
// ===============================
export const getHealthBag = createAsyncThunk(
  "healthBag/fetchBuyer",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetchHealthBag(id);
      return response;
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Failed to fetch health bag");
    }
  }
);

export const createHealthBagItem = createAsyncThunk(
  "healthBag/create",
  async (data: createHealthBagDTO, { rejectWithValue }) => {
    try {
      const response = await createHealthBag(data);
      return response;
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Failed to create health bag item");
    }
  }
);

export const removeHealthBagItem = createAsyncThunk(
  "healthBag/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await deleteHealthBag(id);
      return { id, ...response };
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Failed to delete health bag item");
    }
  }
);

export const getHealthBagAdmin = createAsyncThunk(
  "healthBag/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchHealthBagAdmin();
      return response;
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Failed to fetch admin health bag");
    }
  }
);

// ===============================
// SLICE
// ===============================
const healthBagSlice = createSlice({
  name: "healthBag",
  initialState,
  reducers: {
    clearHealthBagMessage: (state) => {
      state.message = null;
    },

    // ===== LOCAL CART (For Non-Logged-in Users) =====
    addLocalHealthBag: (state, action: PayloadAction<HealthBag>) => {
      const local = JSON.parse(localStorage.getItem("healthbag") || "[]");
      local.push(action.payload);
      localStorage.setItem("healthbag", JSON.stringify(local));
      state.items = local;
    },

    removeLocalHealthBag: (state, action: PayloadAction<number>) => {
      const local = JSON.parse(localStorage.getItem("healthbag") || "[]");
      const updated = local.filter(
        (item: HealthBag) => item.id !== action.payload
      );
      localStorage.setItem("healthbag", JSON.stringify(updated));
      state.items = updated;
    },

    loadLocalHealthBag: (state) => {
      const local = localStorage.getItem("healthbag");
      if (local) {
        state.items = JSON.parse(local);
      }
    },

    clearLocalHealthBag: (state) => {
      localStorage.removeItem("healthbag");
      state.items = [];
    },

    mergeLocalHealthBag: (state, action: PayloadAction<HealthBag[]>) => {
      // merges items after login
      const existingIds = new Set(state.items.map((i) => i.product_id));
      const newItems = action.payload.filter(
        (i) => !existingIds.has(i.product_id)
      );
      state.items.push(...newItems);
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH BUYER =====
      .addCase(getHealthBag.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getHealthBag.fulfilled,
        (state, action: PayloadAction<HealthBagResponse>) => {
          state.loading = false;
          state.items = action.payload.data;
          state.error = null;
        }
      )
      .addCase(getHealthBag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ===== CREATE =====
      .addCase(createHealthBagItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        createHealthBagItem.fulfilled,
        (state, action: PayloadAction<HealthBag>) => {
          state.loading = false;
          state.items.push(action.payload);
          state.message = "Item added successfully.";
        }
      )
      .addCase(createHealthBagItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ===== DELETE =====
      .addCase(removeHealthBagItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        removeHealthBagItem.fulfilled,
        (state, action: PayloadAction<{ id: number; message: string }>) => {
          state.loading = false;
          state.items = state.items.filter(
            (item) => item.id !== action.payload.id
          );
          state.message = action.payload.message;
        }
      )
      .addCase(removeHealthBagItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ===== ADMIN =====
      .addCase(getHealthBagAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(getHealthBagAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];
        state.error = null;
      })
      .addCase(getHealthBagAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearHealthBagMessage,
  addLocalHealthBag,
  removeLocalHealthBag,
  loadLocalHealthBag,
  clearLocalHealthBag,
  mergeLocalHealthBag,
} = healthBagSlice.actions;

export default healthBagSlice.reducer;
