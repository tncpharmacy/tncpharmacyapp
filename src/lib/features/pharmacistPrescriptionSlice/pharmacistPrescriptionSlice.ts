import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PrescriptionItem } from "@/types/prescription";
import {
  fetchPrescriptionListPharmacist,
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
  },
});

export const { clearPharmacistPrescriptionState } =
  pharmacistPrescriptionSlice.actions;
export default pharmacistPrescriptionSlice.reducer;
