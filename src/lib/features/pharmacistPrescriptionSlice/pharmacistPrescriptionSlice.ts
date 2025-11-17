import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PrescriptionItem } from "@/types/prescription";
import {
  fetchPrescriptionListPharmacist,
  receivePrescriptionByPharmacist,
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
  PrescriptionItem,
  { prescriptionId: number; pharmacistId: number },
  { rejectValue: string }
>(
  "pharmacistPrescription/receive",
  async ({ prescriptionId, pharmacistId }, { rejectWithValue }) => {
    try {
      const data = await receivePrescriptionByPharmacist(
        prescriptionId,
        pharmacistId
      );
      return data;
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
  PrescriptionItem,
  {
    pharmacistId: number;
    payload: FormData;
  },
  { rejectValue: string }
>(
  "pharmacistPrescription/upload",
  async ({ pharmacistId, payload }, { rejectWithValue }) => {
    try {
      const data = await uploadPrescriptionByPharmacist(pharmacistId, payload);
      return data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to upload prescription"
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
    builder
      .addCase(receivePrescriptionThunk.pending, (state) => {
        state.receiveLoading = true;
        state.receiveError = null;
      })
      .addCase(receivePrescriptionThunk.fulfilled, (state, action) => {
        state.receiveLoading = false;
        state.lastReceived = action.payload;

        // Update the item in the list
        const index = state.list.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(receivePrescriptionThunk.rejected, (state, action) => {
        state.receiveLoading = false;
        state.receiveError = action.payload || "Error receiving prescription";
      });
    // 🔹 Upload prescription
    builder
      .addCase(uploadPrescriptionPharmacistThunk.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(uploadPrescriptionPharmacistThunk.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.lastUploaded = action.payload;

        // Update list item after upload
        const index = state.list.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(uploadPrescriptionPharmacistThunk.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload || "Error uploading prescription";
      });
  },
});

export const { clearPharmacistPrescriptionState } =
  pharmacistPrescriptionSlice.actions;
export default pharmacistPrescriptionSlice.reducer;
