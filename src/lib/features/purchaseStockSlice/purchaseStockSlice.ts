import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createPurchase } from "@/lib/api/purchaseStock";
import { PurchasePayload, PurchaseResponse } from "@/types/purchase";

// 🔹 Define state type
interface PurchaseState {
  loading: boolean;
  success: boolean;
  error: string | null;
  data: PurchaseResponse | null;
}

const initialState: PurchaseState = {
  loading: false,
  success: false,
  error: null,
  data: null,
};

// 🔹 Async thunk with proper typing
export const createPurchaseStock = createAsyncThunk<
  PurchaseResponse, // Return type
  PurchasePayload, // Argument (payload) type
  { rejectValue: string } // Rejection type
>("purchase/createPurchase", async (payload, { rejectWithValue }) => {
  try {
    const response = await createPurchase(payload);
    return response; // ✅ This matches PurchaseResponse
  } catch (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: string }).message)
        : "Failed to create purchase";
    return rejectWithValue(message);
  }
});

// 🔹 Slice definition
const purchaseSlice = createSlice({
  name: "purchase",
  initialState,
  reducers: {
    resetPurchaseState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPurchaseStock.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(
        createPurchaseStock.fulfilled,
        (state, action: PayloadAction<PurchaseResponse>) => {
          state.loading = false;
          state.success = true;
          state.data = action.payload;
        }
      )
      .addCase(
        createPurchaseStock.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.success = false;
          state.error = action.payload ?? "Unknown error";
        }
      );
  },
});

export const { resetPurchaseState } = purchaseSlice.actions;
export default purchaseSlice.reducer;
