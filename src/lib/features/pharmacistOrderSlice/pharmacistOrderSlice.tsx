import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

// ===============================
// 🔹 Import Your APIs Here
// ===============================
import {
  createOrderApi,
  getOrderByBuyerIdApi,
  getOrderByIdApi,
  getOrderListApi,
} from "@/lib/api/pharmacistOrder";

import { PharmacistOrderState } from "@/types/pharmacistOrder";

// ===============================
// 🔹 Initial State
// ===============================

const initialState: PharmacistOrderState = {
  loading: false,
  error: null,
  order: null,
  orders: [],
  buyerOrderList: [],
  orderCreated: false,
  listLoading: false,
  detailsLoading: false,
};

// ===============================
// 🔹 Thunks
// ===============================

// 1️⃣ Create Order
export const createPharmacistOrder = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { buyerId: number; payload: any },
  { rejectValue: string }
>(
  "pharmacistOrder/create",
  async ({ buyerId, payload }, { rejectWithValue }) => {
    try {
      const res = await createOrderApi(buyerId, payload);
      return res.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create order"
      );
    }
  }
);

// 2️⃣ Get Order by Buyer ID
export const getPharmacistOrderByBuyerId = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  { buyerId: number },
  { rejectValue: string }
>("pharmacistOrder/getByBuyerId", async ({ buyerId }, { rejectWithValue }) => {
  try {
    const res = await getOrderByBuyerIdApi(buyerId);
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch order"
    );
  }
});

// 2️⃣ Get Order by ID
export const getPharmacistOrderById = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  { orderId: number },
  { rejectValue: string }
>("pharmacistOrder/getById", async ({ orderId }, { rejectWithValue }) => {
  try {
    const res = await getOrderByIdApi(orderId);
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch order"
    );
  }
});

// 3️⃣ Get All Orders
export const getPharmacistOrders = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  void,
  { rejectValue: string }
>("pharmacistOrder/getAll", async (_, { rejectWithValue }) => {
  try {
    const res = await getOrderListApi();
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch orders"
    );
  }
});

// ===============================
// 🔹 Slice
// ===============================

const pharmacistOrderSlice = createSlice({
  name: "pharmacistOrder",
  initialState,
  reducers: {
    resetPharmacistOrderState: (state) => {
      state.loading = false;
      state.error = null;
      state.order = null;
      state.orderCreated = false;
      state.orders = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // CREATE ORDER
      .addCase(createPharmacistOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.orderCreated = false;
      })
      .addCase(createPharmacistOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderCreated = true;
        state.order = action.payload?.data || null;
        toast.success("Order created successfully!");
      })
      .addCase(createPharmacistOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create order";
      })

      // GET ORDER BY ID
      .addCase(getPharmacistOrderById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(getPharmacistOrderById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.order = action.payload?.data || null;
      })
      .addCase(getPharmacistOrderById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || "Failed to fetch order";
      })

      // GET ORDER BY BUYER ID
      .addCase(getPharmacistOrderByBuyerId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPharmacistOrderByBuyerId.fulfilled, (state, action) => {
        state.loading = false;
        state.buyerOrderList = action.payload?.data || null;
      })
      .addCase(getPharmacistOrderByBuyerId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch order";
      })

      // GET ALL ORDERS
      .addCase(getPharmacistOrders.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(getPharmacistOrders.fulfilled, (state, action) => {
        state.listLoading = false;
        state.orders = action.payload?.data || [];
      })
      .addCase(getPharmacistOrders.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload || "Failed to fetch orders";
      });
  },
});

// ===============================
// 🔹 Export Actions + Reducer
// ===============================

export const { resetPharmacistOrderState } = pharmacistOrderSlice.actions;
export default pharmacistOrderSlice.reducer;
