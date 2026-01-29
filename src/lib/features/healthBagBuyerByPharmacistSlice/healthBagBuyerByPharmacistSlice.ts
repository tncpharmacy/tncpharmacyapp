import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchBuyerList,
  fetchBuyerById,
  updateBuyerById,
  deleteBuyerById,
  increaseBuyerQuantity,
  decreaseBuyerQuantity,
  fetchBuyerByIdForAdmin,
} from "@/lib/api/healthBagBuyerByPharmacist";

interface BuyerState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buyers: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buyer: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: BuyerState = {
  buyers: [],
  buyer: null,
  loading: false,
  error: null,
};

// =========================
// THUNKS
// =========================
export const getBuyerList = createAsyncThunk(
  "buyer/getBuyerList",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchBuyerList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Something went wrong");
    }
  }
);
export const getBuyerById = createAsyncThunk(
  "buyer/getBuyerById",
  async (buyerId: number, { rejectWithValue }) => {
    try {
      return await fetchBuyerById(buyerId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Something went wrong");
    }
  }
);
export const getBuyerByIdForAdmin = createAsyncThunk(
  "buyer/getBuyerByIdForAdmin",
  async (buyerId: number, { rejectWithValue }) => {
    try {
      return await fetchBuyerByIdForAdmin(buyerId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Something went wrong");
    }
  }
);
export const putBuyerById = createAsyncThunk(
  "buyer/putBuyerById",
  async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { id, payload }: { id: number; payload: any },
    { rejectWithValue }
  ) => {
    try {
      return await updateBuyerById(id, payload);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Something went wrong");
    }
  }
);
export const removeBuyerById = createAsyncThunk(
  "buyer/removeBuyerById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await deleteBuyerById(id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Something went wrong");
    }
  }
);
export const increaseQuantity = createAsyncThunk(
  "buyer/increaseQuantity",
  async (cartId: number, { rejectWithValue }) => {
    try {
      return await increaseBuyerQuantity(cartId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Something went wrong");
    }
  }
);
export const decreaseQuantity = createAsyncThunk(
  "buyer/decreaseQuantity",
  async (cartId: number, { rejectWithValue }) => {
    try {
      return await decreaseBuyerQuantity(cartId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Something went wrong");
    }
  }
);
// =========================
// SLICE
// =========================
export const healthBagBuyerByPharmacistSlice = createSlice({
  name: "buyer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Buyer List
      .addCase(getBuyerList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBuyerList.fulfilled, (state, action) => {
        state.loading = false;
        state.buyers = action.payload.data;
      })
      .addCase(getBuyerList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Buyer By ID
    builder.addCase(getBuyerById.fulfilled, (state, action) => {
      state.buyer = action.payload.data;
    });
    // Get Buyer By ID For Admin
    builder.addCase(getBuyerByIdForAdmin.fulfilled, (state, action) => {
      state.buyer = action.payload.data;
    });
    // Update Buyer
    builder.addCase(putBuyerById.fulfilled, (state, action) => {
      const updatedBuyer = action.payload;
      state.buyers = state.buyers.map((b) =>
        b.id === updatedBuyer.id ? updatedBuyer : b
      );
    });

    // Delete Buyer
    builder.addCase(removeBuyerById.fulfilled, (state, action) => {
      state.buyer = state.buyer.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => item.id !== action.payload
      );
    });

    // Increase / Decrease Quantity
    builder
      .addCase(increaseQuantity.fulfilled, (state, action) => {
        state.buyer = action.payload;
      })
      .addCase(decreaseQuantity.fulfilled, (state, action) => {
        state.buyer = action.payload;
      });
  },
});

export default healthBagBuyerByPharmacistSlice.reducer;
