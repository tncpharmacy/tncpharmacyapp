import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PrescriptionItem } from "@/types/prescription";
import {
  deletePrescriptionByPharmacist,
  extractPrescriptionMedicines,
  fetchPrescriptionListPharmacist,
  OcrExtractedMedicine,
  OcrExtractResponse,
  receivePrescriptionByPharmacist,
  ReceivePrescriptionResponse,
  updatePrescriptionStatusPharmacist,
  uploadPrescriptionByPharmacist,
} from "@/lib/api/pharmacistPrescription";

interface PharmacistPrescriptionState {
  list: PrescriptionItem[];
  loadingList: boolean;
  errorList: string | null;

  receiveLoading: boolean;
  receiveError: string | null;
  lastReceived: PrescriptionItem | null;

  uploadLoading: boolean;
  uploadError: string | null;
  lastUploaded: PrescriptionItem | null;

  loading: boolean;
  error: string | null;
  prescription: PrescriptionItem | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  productList: any[];
  totalMedicinesFound: number;

  statusUpdateLoading?: boolean;
  statusUpdateError?: string | null;

  // 🔍 NEW OCR (ocrnew) extraction
  extractLoading: boolean;
  extractError: string | null;
  extractedMedicines: OcrExtractedMedicine[];
  totalExtractedMedicines: number;
}

const initialState: PharmacistPrescriptionState = {
  list: [],
  loadingList: false,
  errorList: null,

  receiveLoading: false,
  receiveError: null,
  lastReceived: null,

  uploadLoading: false,
  uploadError: null,
  lastUploaded: null,

  loading: false,
  error: null,
  prescription: null,
  productList: [],

  statusUpdateLoading: false,
  statusUpdateError: null,

  totalMedicinesFound: 0,

  extractLoading: false,
  extractError: null,
  extractedMedicines: [],
  totalExtractedMedicines: 0,
};

// 🔹 Thunks
export const getPrescriptionListPharmacistThunk = createAsyncThunk<
  PrescriptionItem[],
  void,
  { rejectValue: string }
>("pharmacistPrescription/getList", async (_, { rejectWithValue }) => {
  try {
    const data = await fetchPrescriptionListPharmacist();
    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch prescriptions"
    );
  }
});

export const receivePrescriptionThunk = createAsyncThunk<
  ReceivePrescriptionResponse,
  { prescriptionId: number; pharmacistId: number },
  { rejectValue: string }
>(
  "pharmacistPrescription/receive",
  async ({ prescriptionId, pharmacistId }, { rejectWithValue }) => {
    try {
      const res = await receivePrescriptionByPharmacist(
        prescriptionId,
        pharmacistId
      );
      return res;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark as received"
      );
    }
  }
);

// 🔹 Upload Prescription (after Excel import)
export const uploadPrescriptionPharmacistThunk = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  {
    pharmacistId: number;
    payload: FormData;
  },
  { rejectValue: string }
>(
  "pharmacistPrescription/upload",
  async ({ pharmacistId, payload }, { rejectWithValue }) => {
    try {
      const res = await uploadPrescriptionByPharmacist(pharmacistId, payload);
      return res;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to upload prescription"
      );
    }
  }
);

export const updatePrescriptionStatusPharmacistThunk = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  { prescriptionId: number; pharmacistId: number },
  { rejectValue: string }
>(
  "pharmacistPrescription/updateStatus",
  async ({ prescriptionId, pharmacistId }, { rejectWithValue }) => {
    try {
      const res = await updatePrescriptionStatusPharmacist(
        prescriptionId,
        pharmacistId
      );
      return res;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update prescription status"
      );
    }
  }
);

// 🔍 NEW OCR — extract medicines from prescription file via /ocrnew/ API
export const extractPrescriptionMedicinesThunk = createAsyncThunk<
  OcrExtractResponse,
  { fileUrl: string },
  { rejectValue: string }
>(
  "pharmacistPrescription/extractMedicines",
  async ({ fileUrl }, { rejectWithValue }) => {
    try {
      const res = await extractPrescriptionMedicines(fileUrl);
      return res;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to extract medicines from prescription"
      );
    }
  }
);

export const deletePrescriptionPharmacistThunk = createAsyncThunk<
  number,
  { prescriptionId: number },
  { rejectValue: string }
>(
  "pharmacistPrescription/delete",
  async ({ prescriptionId }, { rejectWithValue }) => {
    try {
      await deletePrescriptionByPharmacist(prescriptionId);
      return prescriptionId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete prescription"
      );
    }
  }
);

// 🔹 Slice
const pharmacistPrescriptionSlice = createSlice({
  name: "pharmacistPrescription",
  initialState,
  reducers: {
    clearPharmacistPrescriptionState: (state) => {
      state.list = [];
      state.errorList = null;
      state.loadingList = false;

      state.lastReceived = null;
      state.receiveError = null;
      state.receiveLoading = false;
    },
  },
  extraReducers: (builder) => {
    // 🔹 Fetch list
    builder
      .addCase(getPrescriptionListPharmacistThunk.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(
        getPrescriptionListPharmacistThunk.fulfilled,
        (state, action) => {
          state.loadingList = false;
          state.list = action.payload;
        }
      )
      .addCase(getPrescriptionListPharmacistThunk.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload || "Error fetching list";
      });

    // 🔹 Receive prescription
    builder.addCase(receivePrescriptionThunk.fulfilled, (state, action) => {
      state.receiveLoading = false;

      const received = action.payload.data;
      const productList = action.payload.product_list.medicines;

      // save received prescription
      state.lastReceived = received;

      // update list
      const index = state.list.findIndex((p) => p.id === received.id);
      if (index !== -1) {
        state.list[index] = received;
      }

      // save product_list from OCR
      state.productList = productList;
      state.totalMedicinesFound =
        action.payload.product_list.total_medicines_found;
    });
    // 🔹 Upload prescription
    builder.addCase(uploadPrescriptionPharmacistThunk.pending, (state) => {
      state.uploadLoading = true;
      state.uploadError = null;
    });
    builder
      .addCase(uploadPrescriptionPharmacistThunk.fulfilled, (state, action) => {
        state.loading = false;

        state.prescription = action.payload.data; // prescription object
        state.productList = action.payload.product_list?.medicines || []; // medicines list
      })
      .addCase(uploadPrescriptionPharmacistThunk.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload || "Error uploading prescription";
      });
    builder
      .addCase(updatePrescriptionStatusPharmacistThunk.pending, (state) => {
        state.statusUpdateLoading = true;
        state.statusUpdateError = null;
      })
      .addCase(
        updatePrescriptionStatusPharmacistThunk.fulfilled,
        (state, action) => {
          state.statusUpdateLoading = false;

          // 🔥 backend agar updated prescription send kare
          if (action.payload?.data) {
            const updated = action.payload.data;
            const index = state.list.findIndex((p) => p.id === updated.id);
            if (index !== -1) {
              state.list[index] = updated;
            }
          }
        }
      )
      .addCase(
        updatePrescriptionStatusPharmacistThunk.rejected,
        (state, action) => {
          state.statusUpdateLoading = false;
          state.statusUpdateError =
            action.payload || "Failed to update prescription status";
        }
      );
    // 🔍 NEW OCR extraction
    builder
      .addCase(extractPrescriptionMedicinesThunk.pending, (state) => {
        state.extractLoading = true;
        state.extractError = null;
        state.extractedMedicines = [];
        state.totalExtractedMedicines = 0;
      })
      .addCase(
        extractPrescriptionMedicinesThunk.fulfilled,
        (state, action) => {
          state.extractLoading = false;
          state.extractedMedicines = action.payload.medicines || [];
          state.totalExtractedMedicines =
            action.payload.total_medicines_found || 0;

          if (!action.payload.success) {
            state.extractError =
              action.payload.message || "OCR extraction failed";
          }
        }
      )
      .addCase(extractPrescriptionMedicinesThunk.rejected, (state, action) => {
        state.extractLoading = false;
        state.extractError =
          action.payload || "Failed to extract medicines from prescription";
      });

    builder
      .addCase(deletePrescriptionPharmacistThunk.fulfilled, (state, action) => {
        const deletedId = action.payload;

        // remove from list
        state.list = state.list.filter((p) => p.id !== deletedId);

        // clear current prescription if same
        if (state.prescription?.id === deletedId) {
          state.prescription = null;
        }
      })
      .addCase(deletePrescriptionPharmacistThunk.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to delete prescription by pharmacist";
      });
  },
});

export const { clearPharmacistPrescriptionState } =
  pharmacistPrescriptionSlice.actions;
export default pharmacistPrescriptionSlice.reducer;
