import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchBuyerByPharmacyIdApi,
  fetchBuyerForSuperAdminApi,
  fetchPharmacistBuyerByIdApi,
  updateBuyerForPharmacistApi,
} from "@/lib/api/pharmacistBuyerList"; // adjust path

interface BuyerProfile {
  name: string;
  number: string;
  email: string;
  uhid: string;
}
interface BuyerState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pharmacyBuyers: any[];
  pharmacyBuyersById: {
    data: BuyerProfile;
    message?: string;
    statusCode?: number;
    success?: boolean;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  superAdminBuyers: any[];

  loadingPharmacyBuyers: boolean;
  loadingSuperAdminBuyers: boolean;

  errorPharmacyBuyers: string | null;
  errorSuperAdminBuyers: string | null;
}

const initialState: BuyerState = {
  pharmacyBuyers: [],
  pharmacyBuyersById: null,

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

export const getPharmacistBuyerByIdThunk = createAsyncThunk<
  {
    data: BuyerProfile;
    message: string;
    statusCode: number;
    success: boolean;
  },
  number,
  { rejectValue: string }
>(
  "buyers/getPharmacistByBuyerDetails",
  async (buyerId, { rejectWithValue }) => {
    try {
      const data = await fetchPharmacistBuyerByIdApi(buyerId);
      return data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load pharmacy buyers"
      );
    }
  }
);

export const updateBuyerForPharmacistThunk = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { buyerId: number; payload: any },
  { rejectValue: string }
>(
  "buyers/updateBuyerForPharmacist",
  async ({ buyerId, payload }, { rejectWithValue }) => {
    try {
      const data = await updateBuyerForPharmacistApi(buyerId, payload);
      return data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update buyer"
      );
    }
  }
);

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

const pharmacistBuyerListSlice = createSlice({
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

    // 📌 Pharmacist Buyers By Id
    builder.addCase(getPharmacistBuyerByIdThunk.pending, (state) => {
      state.loadingPharmacyBuyers = true;
      state.errorPharmacyBuyers = null;
    });
    builder.addCase(getPharmacistBuyerByIdThunk.fulfilled, (state, action) => {
      state.loadingPharmacyBuyers = false;
      state.pharmacyBuyersById = action.payload;
    });
    builder.addCase(getPharmacistBuyerByIdThunk.rejected, (state, action) => {
      state.loadingPharmacyBuyers = false;
      state.errorPharmacyBuyers = action.payload || "Error loading buyers";
    });

    // pharmacist buyer update
    builder.addCase(updateBuyerForPharmacistThunk.pending, (state) => {
      state.loadingPharmacyBuyers = true;
    });

    builder.addCase(
      updateBuyerForPharmacistThunk.fulfilled,
      (state, action) => {
        state.loadingPharmacyBuyers = false;

        // OPTIONAL — agar list me bhi update reflect karna ho to
        const updated = action.payload;
        state.pharmacyBuyers = state.pharmacyBuyers.map((buyer) =>
          buyer.id === updated.id ? updated : buyer
        );
      }
    );

    builder.addCase(updateBuyerForPharmacistThunk.rejected, (state, action) => {
      state.loadingPharmacyBuyers = false;
      state.errorPharmacyBuyers = action.payload || "Error updating buyer";
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

export default pharmacistBuyerListSlice.reducer;
