// src/redux/slices/prescriptionSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  uploadPrescriptionPublic,
  uploadPrescriptionLogin,
} from "@/lib/api/prescription";
import { PrescriptionItem } from "@/types/prescription";

interface PrescriptionState {
  loading: boolean;
  data: PrescriptionItem | null;
  error: string | null;
  sessionId: string | null;
}

const initialState: PrescriptionState = {
  loading: false,
  data: null,
  error: null,
  sessionId: null,
};

// 🔓 Public upload
export const uploadPrescriptionPublicThunk = createAsyncThunk(
  "prescription/uploadPublic",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await uploadPrescriptionPublic(formData);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Prescription Upload failed");
    }
  }
);

// 🔐 Logged-in upload
export const uploadPrescriptionLoginThunk = createAsyncThunk(
  "prescription/uploadLogin",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await uploadPrescriptionLogin(formData);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Prescription Upload failed");
    }
  }
);

const prescriptionSlice = createSlice({
  name: "prescription",
  initialState,
  reducers: {
    clearPrescriptionState: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
      state.sessionId = null;
    },
  },
  extraReducers: (builder) => {
    // 🔓 PUBLIC UPLOAD
    builder.addCase(uploadPrescriptionPublicThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      uploadPrescriptionPublicThunk.fulfilled,
      (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.sessionId = action.payload.session_id || null;
      }
    );
    builder.addCase(uploadPrescriptionPublicThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 🔐 LOGIN UPLOAD
    builder.addCase(uploadPrescriptionLoginThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(uploadPrescriptionLoginThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload.data;
      state.sessionId = action.payload.session_id || null;
    });
    builder.addCase(uploadPrescriptionLoginThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearPrescriptionState } = prescriptionSlice.actions;
export default prescriptionSlice.reducer;
