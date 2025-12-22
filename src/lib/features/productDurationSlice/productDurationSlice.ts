import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchProductDuration,
  fetchProductDurationById,
  createProductDurationApi,
  updateProductDurationApi,
  deleteProductDurationApi,
} from "@/lib/api/productDuration";
import {
  ProductDuration,
  ProductDurationResponse,
  CreateProductDurationDTO,
} from "@/types/productDuration";

/* =========================
   STATE TYPE
========================= */
interface ProductDurationState {
  list: ProductDuration[];
  current: ProductDuration | null;
  loading: boolean;
  error: string | null;
}

/* =========================
   INITIAL STATE
========================= */
const initialState: ProductDurationState = {
  list: [],
  current: null,
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */

// 🔹 GET ALL
export const getProductDurations = createAsyncThunk<
  ProductDuration[],
  void,
  { rejectValue: string }
>("productDuration/getAll", async (_, { rejectWithValue }) => {
  try {
    const res: ProductDurationResponse = await fetchProductDuration();
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to fetch durations"
    );
  }
});

// 🔹 GET BY ID
export const getProductDurationById = createAsyncThunk<
  ProductDuration,
  number,
  { rejectValue: string }
>("productDuration/getById", async (id, { rejectWithValue }) => {
  try {
    return await fetchProductDurationById(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to fetch duration"
    );
  }
});

// 🔹 CREATE
export const createProductDuration = createAsyncThunk<
  ProductDuration,
  CreateProductDurationDTO,
  { rejectValue: string }
>("productDuration/create", async (data, { rejectWithValue }) => {
  try {
    return await createProductDurationApi(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to create duration"
    );
  }
});

// 🔹 UPDATE
export const updateProductDuration = createAsyncThunk<
  ProductDuration,
  { id: number; data: CreateProductDurationDTO },
  { rejectValue: string }
>("productDuration/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await updateProductDurationApi(id, data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to update duration"
    );
  }
});

// 🔹 DELETE
export const deleteProductDuration = createAsyncThunk<
  { id: number; message: string },
  number,
  { rejectValue: string }
>("productDuration/delete", async (id, { rejectWithValue }) => {
  try {
    const res = await deleteProductDurationApi(id);
    return { id, message: res.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to delete duration"
    );
  }
});

/* =========================
   SLICE
========================= */
const productDurationSlice = createSlice({
  name: "productDuration",
  initialState,
  reducers: {
    clearCurrentDuration(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- GET ALL ---------- */
      .addCase(getProductDurations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductDurations.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getProductDurations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      /* ---------- GET BY ID ---------- */
      .addCase(getProductDurationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductDurationById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(getProductDurationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      /* ---------- CREATE ---------- */
      .addCase(createProductDuration.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      /* ---------- UPDATE ---------- */
      .addCase(updateProductDuration.fulfilled, (state, action) => {
        const index = state.list.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.current = action.payload;
      })

      /* ---------- DELETE ---------- */
      .addCase(deleteProductDuration.fulfilled, (state, action) => {
        state.list = state.list.filter((d) => d.id !== action.payload.id);
      });
  },
});

/* =========================
   EXPORTS
========================= */
export const { clearCurrentDuration } = productDurationSlice.actions;

export default productDurationSlice.reducer;
