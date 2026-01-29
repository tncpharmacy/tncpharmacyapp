import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  createPurchase,
  fetchPharmacyStock,
  getPharmacistByIdApi,
  getPharmacistListApi,
  getStockListSuperAdminApi,
} from "@/lib/api/purchaseStock";
import { PurchasePayload, PurchaseResponse } from "@/types/purchase";
import { StockItem, StockResponse } from "@/types/stock";

// 🔹 Define state type
interface PurchaseState {
  items: StockItem[];
  purchaseStockList: StockItem[];
  purchaseStockById: StockItem | null;
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
  items: [],
  purchaseStockList: [],
  purchaseStockById: null as StockItem | null,
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

export const getPharmacyStock = createAsyncThunk<StockResponse, number>(
  "stock/fetchPharmacy",
  async (pharmacyId, { rejectWithValue }) => {
    try {
      const response = await fetchPharmacyStock(pharmacyId);
      return response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch pharmacy stock"
      );
    }
  }
);

// 2️⃣ Get Pharmacist Purchase by ID
export const getPharmacistById = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  { id: number },
  { rejectValue: string }
>("stock/getPharmacistPurchaseById", async ({ id }, { rejectWithValue }) => {
  try {
    const res = await getPharmacistByIdApi(id);
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch order"
    );
  }
});

// 2️⃣ Get Pharmacist List
export const getPharmacistList = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  void,
  { rejectValue: string }
>("stock/getPharmacistPurchase", async (_, { rejectWithValue }) => {
  try {
    const res = await getPharmacistListApi();
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.log("API ERROR ====", err); // 👈 ADD THIS
    return rejectWithValue(err.response?.data?.message || "Failed");
  }
});

// 2️⃣ Get Stock List For Super Admin
export const getStockListSuperAdmin = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  void,
  { rejectValue: string }
>("stock/getStockListSuperAdmin", async (_, { rejectWithValue }) => {
  try {
    const res = await getStockListSuperAdminApi();
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.log("API ERROR ====", err); // 👈 ADD THIS
    return rejectWithValue(err.response?.data?.message || "Failed");
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
    resetPharmacistById(state) {
      state.purchaseStockById = null;
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
      )
      // get purchase stock
      .addCase(getPharmacyStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getPharmacyStock.fulfilled,
        (state, action: PayloadAction<StockResponse>) => {
          state.loading = false;
          state.items = action.payload.data;
        }
      )
      .addCase(getPharmacyStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // GET PURCHASE PURCHASE BY ID
      .addCase(getPharmacistById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPharmacistById.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseStockById = action.payload?.data;
      })
      .addCase(getPharmacistById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch order";
      })

      // GET ALL PHARMACIST PURCHASE
      .addCase(getPharmacistList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPharmacistList.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseStockList = action.payload?.data || [];
      })
      .addCase(getPharmacistList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
      })
      // GET STOCK LIST SUPER ADMIN
      .addCase(getStockListSuperAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStockListSuperAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseStockList = action.payload?.data || [];
      })
      .addCase(getStockListSuperAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
      });
  },
});

export const { resetPurchaseState, resetPharmacistById } =
  purchaseSlice.actions;
export default purchaseSlice.reducer;
