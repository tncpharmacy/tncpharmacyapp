import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchHealthBag,
  createHealthBag,
  deleteHealthBag,
  createHealthBagDTO,
  increaseQuantity,
  decreaseQuantity,
} from "@/lib/api/healthBagPharmacist";
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

// ✅ Increase Quantity
export const increaseHealthBagQty = createAsyncThunk(
  "healthBag/increaseQty",
  async (
    {
      cart_id,
      buyer_id,
      product_id,
      quantity,
    }: {
      cart_id: number;
      buyer_id: number;
      product_id: number;
      quantity: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await increaseQuantity(
        cart_id,
        buyer_id,
        product_id,
        quantity
      );
      return res; // backend response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Increase qty failed");
    }
  }
);

// ✅ Decrease Quantity
export const decreaseHealthBagQty = createAsyncThunk(
  "healthBag/decreaseQty",
  async (
    {
      cart_id,
      buyer_id,
      product_id,
      quantity,
    }: {
      cart_id: number;
      buyer_id: number;
      product_id: number;
      quantity: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await decreaseQuantity(
        cart_id,
        buyer_id,
        product_id,
        quantity
      );
      return res; // backend response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Decrease qty failed");
    }
  }
);

// ===============================
// SLICE
// ===============================
const healthBagSPharmacistSlice = createSlice({
  name: "healthBag",
  initialState,
  reducers: {
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
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
          const exists = state.items.find(
            (i) => i.product_id === action.payload.product_id
          );
          if (exists) {
            state.items = state.items.map((i) =>
              i.product_id === action.payload.product_id ? action.payload : i
            );
          } else {
            state.items.push(action.payload);
          }
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
      // =========== INCREASE QTY ===========
      .addCase(increaseHealthBagQty.pending, (state) => {
        state.loading = true;
      })
      .addCase(increaseHealthBagQty.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const updated = action.payload?.data;
        if (!updated) return;

        const item = state.items.find(
          (i) =>
            i.id === updated.cart_id ||
            i.productid === updated.product_id ||
            i.product_id === updated.product_id
        );

        if (item) {
          item.qty = updated.quantity;
          item.quantity = updated.quantity;
        }

        state.message = "Quantity increased";
      })
      .addCase(increaseHealthBagQty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // =========== DECREASE QTY ===========
      .addCase(decreaseHealthBagQty.pending, (state) => {
        state.loading = true;
      })
      .addCase(decreaseHealthBagQty.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updated = action.payload?.data;
        if (!updated) return;

        const item = state.items.find(
          (i) =>
            i.id === updated.cart_id ||
            i.productid === updated.product_id ||
            i.product_id === updated.product_id
        );

        if (item) {
          item.qty = updated.quantity;
          item.quantity = updated.quantity;
        }

        state.message = "Quantity decreased";
      })
      .addCase(decreaseHealthBagQty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMessage } = healthBagSPharmacistSlice.actions;

export default healthBagSPharmacistSlice.reducer;
