import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchSupplierApi,
  fetchSupplierByIdApi,
  createSupplierApi,
  updateSupplierApi,
  toggleSupplierStatusApi,
} from "@/lib/api/supplier";
import { Supplier } from "@/types/supplier";
import { AxiosError, AxiosResponse } from "axios";

interface PharmacyState {
  list: Supplier[];
  loading: boolean;
  error: string | null;
}

const initialState: PharmacyState = {
  list: [],
  loading: false,
  error: null,
};

// 🔥 FSupplier
export const fetchSupplier = createAsyncThunk<
  Supplier[],
  void,
  { rejectValue: string }
>("supplier/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const list = await fetchSupplierApi();
    return list;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Fetch failed");
  }
});

// 🔥 Get Supplier by ID
export const fetchSupplierById = createAsyncThunk<
  Supplier,
  number,
  { rejectValue: string }
>("supplier/fetchById", async (id, { rejectWithValue }) => {
  try {
    const supplier = await fetchSupplierByIdApi(id);
    return supplier;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch supplier details");
  }
});

// toggle status thunk
export const toggleSupplierStatus = createAsyncThunk<
  Supplier,
  number,
  { rejectValue: string }
>("supplier/toggleStatus", async (id, { rejectWithValue }) => {
  try {
    const updated = await toggleSupplierStatusApi(id);
    return updated;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Status update failed");
  }
});

export const addSupplier = createAsyncThunk<
  Supplier, // return type
  FormData // argument type
>("supplier/add", async (formData, { rejectWithValue }) => {
  try {
    // ⬇️ Directly returns Supplier object (NO res.data needed)
    const supplier = await createSupplierApi(formData);
    return supplier;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue(
      error.response?.data?.message ?? "Failed to add supplier"
    );
  }
});

// ✅ Update/Supplier thunk
export const editSupplier = createAsyncThunk<
  Supplier,
  { id: number; data: FormData }
>("supplier/edit", async ({ id, data }, { rejectWithValue }) => {
  try {
    const supplier = await updateSupplierApi(id, data);
    return supplier;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue(
      error.response?.data?.message ?? "Failed to update supplier"
    );
  }
});

const supplierSlice = createSlice({
  name: "supplier",
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
      .addCase(fetchSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSupplier.fulfilled,
        (state, action: PayloadAction<Supplier[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(fetchSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load pharmacies";
      })

      // 📌 Fetch Supplier by ID
      .addCase(fetchSupplierById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        state.loading = false;

        // If this supplier already exists in list → replace
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        } else {
          // Otherwise push (useful for supplier-details screen)
          state.list.push(action.payload);
        }
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? "Failed to fetch supplier details";
      })

      // ✅ status
      .addCase(toggleSupplierStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.list = state.list.map((p) =>
          p.id === updated.id ? { ...p, status: updated.status } : p
        );
      })
      .addCase(toggleSupplierStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleSupplierStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Status update failed";
      })
      // ✅ Add pharmacy
      .addCase(addSupplier.pending, (state) => {
        state.loading = true;
      })
      .addCase(addSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(addSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Edit pharmacy
      .addCase(editSupplier.pending, (state) => {
        state.loading = true;
      })
      .addCase(editSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(editSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPharmacies } = supplierSlice.actions;
export default supplierSlice.reducer;
