import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchBuyerByPharmacyIdApi,
  fetchBuyerForSuperAdminApi,
} from "@/lib/api/pharmacistBuyerList"; // adjust path

interface BuyerState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pharmacyBuyers: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  superAdminBuyers: any[];

  loadingPharmacyBuyers: boolean;
  loadingSuperAdminBuyers: boolean;

  errorPharmacyBuyers: string | null;
  errorSuperAdminBuyers: string | null;
}

const initialState: BuyerState = {
  pharmacyBuyers: [],
  superAdminBuyers: [],

  loadingPharmacyBuyers: false,
  loadingSuperAdminBuyers: false,

  errorPharmacyBuyers: null,
  errorSuperAdminBuyers: null,
};

export const getPharmacyBuyersThunk = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any[],
  number,
  { rejectValue: string }
>("buyers/getPharmacyBuyers", async (pharmacyId, { rejectWithValue }) => {
  try {
    const data = await fetchBuyerByPharmacyIdApi(pharmacyId);
    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to load pharmacy buyers"
    );
  }
});

export const getSuperAdminBuyersThunk = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any[],
  void,
  { rejectValue: string }
>("buyers/getSuperAdminBuyers", async (_, { rejectWithValue }) => {
  try {
    const data = await fetchBuyerForSuperAdminApi();
    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to load super admin buyers"
    );
  }
});

const buyerSlice = createSlice({
  name: "buyers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // 📌 Pharmacy Buyers
    builder.addCase(getPharmacyBuyersThunk.pending, (state) => {
      state.loadingPharmacyBuyers = true;
      state.errorPharmacyBuyers = null;
    });
    builder.addCase(getPharmacyBuyersThunk.fulfilled, (state, action) => {
      state.loadingPharmacyBuyers = false;
      state.pharmacyBuyers = action.payload;
    });
    builder.addCase(getPharmacyBuyersThunk.rejected, (state, action) => {
      state.loadingPharmacyBuyers = false;
      state.errorPharmacyBuyers = action.payload || "Error loading buyers";
    });

    // 📌 Super Admin Buyers
    builder.addCase(getSuperAdminBuyersThunk.pending, (state) => {
      state.loadingSuperAdminBuyers = true;
      state.errorSuperAdminBuyers = null;
    });
    builder.addCase(getSuperAdminBuyersThunk.fulfilled, (state, action) => {
      state.loadingSuperAdminBuyers = false;
      state.superAdminBuyers = action.payload;
    });
    builder.addCase(getSuperAdminBuyersThunk.rejected, (state, action) => {
      state.loadingSuperAdminBuyers = false;
      state.errorSuperAdminBuyers = action.payload || "Error loading buyers";
    });
  },
});

export default buyerSlice.reducer;
