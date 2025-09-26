// lib/features/pharmacySelfSlice/pharmacySelfSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getPharmacist, updatePharmacist } from "@/lib/api/pharmacistSelf";
import { getUserId } from "@/lib/auth/auth";
import { Pharmacist } from "@/types/pharmacist";

interface BackendError {
  message?: string;
  errors?: Record<string, string[]>;
}

interface PharmacySelfState {
  selfPharmacy: Pharmacist | null;
  loading: boolean;
  error: BackendError | null;
}

const initialState: PharmacySelfState = {
  selfPharmacy: null,
  loading: false,
  error: null,
};

// ✅ Async thunk for GET
export const fetchPharmacistSelf = createAsyncThunk<
  Pharmacist,
  void,
  { rejectValue: string }
>("pharmacistSelf/fetchPharmacistSelf", async (_, { rejectWithValue }) => {
  try {
    const id = getUserId();
    if (!id) throw new Error("User ID not found");
    const pharmacy = await getPharmacist(id); // ✅ Pharmacy object directly
    return pharmacy;
  } catch (err: unknown) {
    if (err instanceof Error) return rejectWithValue(err.message);
    return rejectWithValue("Failed to fetch pharmacy self");
  }
});

// ✅ Async thunk for PATCH
export const patchPharmacist = createAsyncThunk<
  Pharmacist,
  FormData,
  { rejectValue: BackendError } // any ya proper type
>("pharmacistSelf/patchPharmacist", async (formData, { rejectWithValue }) => {
  try {
    const id = getUserId();
    if (!id) throw new Error("User ID not found");

    const response = await updatePharmacist(id, formData); // axios patch
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
      .addCase(fetchPharmacistSelf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPharmacistSelf.fulfilled,
        (state, action: PayloadAction<Pharmacist>) => {
          state.loading = false;
          state.selfPharmacy = action.payload; // ✅ direct Pharmacy
        }
      )
      .addCase(fetchPharmacistSelf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as BackendError;
      })

      // PATCH
      .addCase(patchPharmacist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        patchPharmacist.fulfilled,
        (state, action: PayloadAction<Pharmacist>) => {
          state.loading = false;
          state.selfPharmacy = action.payload; // ✅ update directly
        }
      )
      .addCase(patchPharmacist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as BackendError;
      });
  },
});

export default pharmacySelfSlice.reducer;
