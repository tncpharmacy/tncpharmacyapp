import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  uploadPrescription,
  linkPrescriptionToBuyer,
  uploadPrescriptionFromBuyerCart,
  extractMedicinesFromPrescriptionFile,
} from "@/lib/api/prescription";
import { PrescriptionItem } from "@/types/prescription";
import { OcrExtractedMedicine, OcrExtractResponse } from "@/types/ocr";

interface PrescriptionState {
  loading: boolean;
  data: PrescriptionItem[];
  error: string | null;
  sessionId: string | null;
  success: boolean;

  // 🔍 New OCR: medicines detected in the buyer's prescription
  extractLoading: boolean;
  extractError: string | null;
  extractedMedicines: OcrExtractedMedicine[];
  totalExtractedMedicines: number;
}

const initialState: PrescriptionState = {
  loading: false,
  data: [],
  error: null,
  sessionId: null,
  success: false,

  extractLoading: false,
  extractError: null,
  extractedMedicines: [],
  totalExtractedMedicines: 0,
};

export const uploadPrescriptionFromBuyerCartThunk = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  { formData: FormData; token: string },
  { rejectValue: string }
>(
  "prescription/uploadFromBuyerCart",
  async ({ formData, token }, { rejectWithValue }) => {
    try {
      const res = await uploadPrescriptionFromBuyerCart({ formData, token });
      // 🔥 safety
      if (!res) {
        return rejectWithValue("No response from server");
      }
      return res;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || err?.response?.data || "Upload failed"
      );
    }
  }
);

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

// 🔍 Read prescription with the new OCR API (works for guests too)
export const extractPrescriptionMedicinesThunk = createAsyncThunk<
  OcrExtractResponse,
  { file: File },
  { rejectValue: string }
>("prescription/extractMedicines", async ({ file }, { rejectWithValue }) => {
  try {
    const res = await extractMedicinesFromPrescriptionFile(file);
    return res;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ||
        err?.message ||
        "Could not read medicines from the prescription"
    );
  }
});

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
    clearExtractedMedicines: (state) => {
      state.extractLoading = false;
      state.extractError = null;
      state.extractedMedicines = [];
      state.totalExtractedMedicines = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // upload prescription from buyer cart
      .addCase(uploadPrescriptionFromBuyerCartThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        uploadPrescriptionFromBuyerCartThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          state.data = action.payload?.data ?? [];
          state.error = null;
        }
      )
      .addCase(
        uploadPrescriptionFromBuyerCartThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        }
      )
      // upload prescription as guest
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
      // 🔍 new OCR extraction
      .addCase(extractPrescriptionMedicinesThunk.pending, (state) => {
        state.extractLoading = true;
        state.extractError = null;
        state.extractedMedicines = [];
        state.totalExtractedMedicines = 0;
      })
      .addCase(extractPrescriptionMedicinesThunk.fulfilled, (state, action) => {
        state.extractLoading = false;
        state.extractedMedicines = action.payload?.medicines || [];
        state.totalExtractedMedicines =
          action.payload?.total_medicines_found || 0;

        if (action.payload && action.payload.success === false) {
          state.extractError =
            action.payload.message ||
            "Could not read medicines from the prescription";
        }
      })
      .addCase(extractPrescriptionMedicinesThunk.rejected, (state, action) => {
        state.extractLoading = false;
        state.extractError =
          (action.payload as string) ||
          "Could not read medicines from the prescription";
      })
      // update prescription after login
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

export const { clearPrescriptionState, clearExtractedMedicines } =
  prescriptionSlice.actions;
export default prescriptionSlice.reducer;
