import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clinicApi } from "@/lib/api/clinic";
import { Clinic } from "@/types/clinic";

interface ClinicState {
  clinics: Clinic[];
  loading: boolean;
  error: string | null;
}

const initialState: ClinicState = {
  clinics: [],
  loading: false,
  error: null,
};

// Fetch all clinics
export const fetchClinics = createAsyncThunk("clinics/fetchAll", async () => {
  const res = await clinicApi.getClinics();
  return res.data;
});

// Add clinic
export const addClinic = createAsyncThunk(
  "clinics/add",
  async (clinic: Partial<Clinic>) => {
    return await clinicApi.createClinic(clinic);
  }
);

// Update clinic
export const updateClinic = createAsyncThunk(
  "clinics/update",
  async ({ id, clinic }: { id: number | string; clinic: Partial<Clinic> }) => {
    return await clinicApi.updateClinic(id, clinic);
  }
);

// Delete clinic
export const deleteClinic = createAsyncThunk(
  "clinics/delete",
  async (id: number | string) => {
    await clinicApi.deleteClinic(id);
    return id;
  }
);

const clinicSlice = createSlice({
  name: "clinics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchClinics.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchClinics.fulfilled,
        (state, action: PayloadAction<Clinic[]>) => {
          state.loading = false;
          state.clinics = action.payload;
        }
      )
      .addCase(fetchClinics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching clinics";
      })

      // add
      .addCase(addClinic.fulfilled, (state, action: PayloadAction<Clinic>) => {
        state.clinics.push(action.payload);
      })

      // update
      .addCase(
        updateClinic.fulfilled,
        (state, action: PayloadAction<Clinic>) => {
          const index = state.clinics.findIndex(
            (c) => c.id === action.payload.id
          );
          if (index !== -1) state.clinics[index] = action.payload;
        }
      )

      // delete
      .addCase(
        deleteClinic.fulfilled,
        (state, action: PayloadAction<number | string>) => {
          state.clinics = state.clinics.filter((c) => c.id !== action.payload);
        }
      );
  },
});

export default clinicSlice.reducer;
