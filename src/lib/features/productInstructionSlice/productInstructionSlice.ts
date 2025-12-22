import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchProductInstruction,
  fetchProductInstructionById,
  createProductInstructionApi,
  updateProductInstructionApi,
  deleteProductInstructionApi,
} from "@/lib/api/productInstruction";
import {
  ProductInstruction,
  ProductInstructionResponse,
  CreateProductInstructionDTO,
} from "@/types/productInstruction";

/* =========================
   STATE TYPE
========================= */
interface ProductInstructionState {
  list: ProductInstruction[];
  current: ProductInstruction | null;
  loading: boolean;
  error: string | null;
}

/* =========================
   INITIAL STATE
========================= */
const initialState: ProductInstructionState = {
  list: [],
  current: null,
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */

// 🔹 GET ALL
export const getProductInstructions = createAsyncThunk<
  ProductInstruction[],
  void,
  { rejectValue: string }
>("productInstruction/getAll", async (_, { rejectWithValue }) => {
  try {
    const res: ProductInstructionResponse = await fetchProductInstruction();
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to fetch instructions"
    );
  }
});

// 🔹 GET BY ID
export const getProductInstructionById = createAsyncThunk<
  ProductInstruction,
  number,
  { rejectValue: string }
>("productInstruction/getById", async (id, { rejectWithValue }) => {
  try {
    return await fetchProductInstructionById(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to fetch instruction"
    );
  }
});

// 🔹 CREATE
export const createProductInstruction = createAsyncThunk<
  ProductInstruction,
  CreateProductInstructionDTO,
  { rejectValue: string }
>("productInstruction/create", async (data, { rejectWithValue }) => {
  try {
    return await createProductInstructionApi(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to create instruction"
    );
  }
});

// 🔹 UPDATE
export const updateProductInstruction = createAsyncThunk<
  ProductInstruction,
  { id: number; data: CreateProductInstructionDTO },
  { rejectValue: string }
>("productInstruction/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await updateProductInstructionApi(id, data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to update instruction"
    );
  }
});

// 🔹 DELETE
export const deleteProductInstruction = createAsyncThunk<
  { id: number; message: string },
  number,
  { rejectValue: string }
>("productInstruction/delete", async (id, { rejectWithValue }) => {
  try {
    const res = await deleteProductInstructionApi(id);
    return { id, message: res.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to delete instruction"
    );
  }
});

/* =========================
   SLICE
========================= */
const productInstructionSlice = createSlice({
  name: "productInstruction",
  initialState,
  reducers: {
    clearCurrentInstruction(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- GET ALL ---------- */
      .addCase(getProductInstructions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductInstructions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getProductInstructions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      /* ---------- GET BY ID ---------- */
      .addCase(getProductInstructionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductInstructionById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(getProductInstructionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      /* ---------- CREATE ---------- */
      .addCase(createProductInstruction.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      /* ---------- UPDATE ---------- */
      .addCase(updateProductInstruction.fulfilled, (state, action) => {
        const index = state.list.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.current = action.payload;
      })

      /* ---------- DELETE ---------- */
      .addCase(deleteProductInstruction.fulfilled, (state, action) => {
        state.list = state.list.filter((i) => i.id !== action.payload.id);
      });
  },
});

/* =========================
   EXPORTS
========================= */
export const { clearCurrentInstruction } = productInstructionSlice.actions;

export default productInstructionSlice.reducer;
