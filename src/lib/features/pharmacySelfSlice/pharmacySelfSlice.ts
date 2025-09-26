// lib/features/pharmacySelfSlice/pharmacySelfSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getPharmacy, updatePharmacy } from "@/lib/api/pharmacySelf";
import { getUserId } from "@/lib/auth/auth";
import { Pharmacy } from "@/types/pharmacy";

interface BackendError {
  message?: string;
  errors?: Record<string, string[]>;
}

interface PharmacySelfState {
  selfPharmacy: Pharmacy | null;
  loading: boolean;
  error: BackendError | null;
}

const initialState: PharmacySelfState = {
  selfPharmacy: null,
  loading: false,
  error: null,
};

// ✅ Async thunk for GET
export const fetchPharmacySelf = createAsyncThunk<
  Pharmacy,
  void,
  { rejectValue: string }
>("pharmacySelf/fetchPharmacySelf", async (_, { rejectWithValue }) => {
  try {
    const id = getUserId();
    if (!id) throw new Error("User ID not found");
    const pharmacy = await getPharmacy(id); // ✅ Pharmacy object directly
    return pharmacy;
  } catch (err: unknown) {
    if (err instanceof Error) return rejectWithValue(err.message);
    return rejectWithValue("Failed to fetch pharmacy self");
  }
});

// ✅ Async thunk for PATCH
export const patchPharmacy = createAsyncThunk<
  Pharmacy,
  FormData,
  { rejectValue: BackendError } // any ya proper type
>("pharmacySelf/patchPharmacy", async (formData, { rejectWithValue }) => {
  try {
    const id = getUserId();
    if (!id) throw new Error("User ID not found");

    const response = await updatePharmacy(id, formData); // axios patch
    return response; // ✅ success response
  } catch (err: unknown) {
    // 🔹 Narrow unknown → object with response
    if (err && typeof err === "object" && "response" in err) {
      const axiosError = err as { response?: { data?: BackendError } };
      if (axiosError.response?.data) {
        return rejectWithValue(axiosError.response.data);
      }
    }

    // 🔹 Normal JS Error
    if (err instanceof Error) {
      return rejectWithValue({ message: err.message });
    }

    // 🔹 Fallback
    return rejectWithValue({ message: "Failed to update pharmacy self" });
  }
});

const pharmacySelfSlice = createSlice({
  name: "pharmacySelf",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(fetchPharmacySelf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPharmacySelf.fulfilled,
        (state, action: PayloadAction<Pharmacy>) => {
          state.loading = false;
          state.selfPharmacy = action.payload; // ✅ direct Pharmacy
        }
      )
      .addCase(fetchPharmacySelf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as BackendError;
      })

      // PATCH
      .addCase(patchPharmacy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        patchPharmacy.fulfilled,
        (state, action: PayloadAction<Pharmacy>) => {
          state.loading = false;
          state.selfPharmacy = action.payload; // ✅ update directly
        }
      )
      .addCase(patchPharmacy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as BackendError;
      });
  },
});

export default pharmacySelfSlice.reducer;
