import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  uploadPrescription,
  linkPrescriptionToBuyer,
} from "@/lib/api/prescription";
import { PrescriptionItem } from "@/types/prescription";

interface PrescriptionState {
  loading: boolean;
  data: PrescriptionItem[];
  error: string | null;
  sessionId: string | null;
}

const initialState: PrescriptionState = {
  loading: false,
  data: [],
  error: null,
  sessionId: null,
};

// 🔓 Guest upload
export const uploadPrescriptionThunk = createAsyncThunk(
  "prescription/upload",
  async ({ formData }: { formData: FormData }, { rejectWithValue }) => {
    try {
      const res = await uploadPrescription({ formData });
      return res;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Upload failed");
    }
  }
);

// 🔐 Link logged-in user
export const linkBuyerThunk = createAsyncThunk(
  "prescription/linkBuyer",
  async (
    {
      sessionId,
      buyerId,
      token,
    }: { sessionId: string; buyerId: number; token: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await linkPrescriptionToBuyer({ sessionId, buyerId, token });
      return res;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Link failed");
    }
  }
);

const prescriptionSlice = createSlice({
  name: "prescription",
  initialState,
  reducers: {
    clearPrescriptionState: (state) => {
      state.loading = false;
      state.data = [];
      state.error = null;
      state.sessionId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadPrescriptionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadPrescriptionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.sessionId = action.payload.session_id;

        // Save session for guest
        localStorage.setItem("PRESCRIPTION_SESSION", action.payload.session_id);
        localStorage.setItem("PRESCRIPTION_ID", String(action.payload.data.id));
      })
      .addCase(uploadPrescriptionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(linkBuyerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(linkBuyerThunk.fulfilled, (state) => {
        state.loading = false;
        localStorage.removeItem("PRESCRIPTION_SESSION");
        localStorage.removeItem("PRESCRIPTION_ID");
      })
      .addCase(linkBuyerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPrescriptionState } = prescriptionSlice.actions;
export default prescriptionSlice.reducer;
