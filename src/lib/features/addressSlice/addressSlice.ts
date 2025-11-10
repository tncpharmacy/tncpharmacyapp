import {
  fetchAddress,
  fetchAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/lib/api/address";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Address, AddressResponse } from "@/types/address";

interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null;
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: AddressState = {
  addresses: [],
  selectedAddress: null,
  loading: false,
  error: null,
  message: null,
};

// ===============================
// ASYNC THUNKS
// ===============================
export const getAddress = createAsyncThunk(
  "address/fetchAll",
  async (buyerId: number, { rejectWithValue }) => {
    try {
      const response = await fetchAddress(buyerId);
      return response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch address");
    }
  }
);

export const getAddressById = createAsyncThunk(
  "address/fetchById",
  async (
    { buyerId, addressId }: { buyerId: number; addressId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchAddressById(buyerId, addressId);
      return response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch address by id");
    }
  }
);

export const addAddress = createAsyncThunk(
  "address/create",
  async (data: Address, { rejectWithValue }) => {
    try {
      const response = await createAddress(data);
      return response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create address");
    }
  }
);

export const editAddress = createAsyncThunk(
  "address/update",
  async (
    {
      id,
      data,
    }: { id: number; data: Partial<Address> | { set_default: boolean } },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateAddress(id, data);
      return response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update address");
    }
  }
);

export const removeAddress = createAsyncThunk(
  "address/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await deleteAddress(id);
      return { id, ...response };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete address");
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    clearAddressMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ======= FETCH ALL =======
      .addCase(getAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getAddress.fulfilled,
        (state, action: PayloadAction<AddressResponse>) => {
          state.loading = false;
          state.addresses = action.payload.data;
          state.error = null;
        }
      )
      .addCase(getAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ======= FETCH BY ID =======
      .addCase(getAddressById.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getAddressById.fulfilled,
        (state, action: PayloadAction<Address>) => {
          state.loading = false;
          state.selectedAddress = action.payload;
          state.error = null;
        }
      )
      .addCase(getAddressById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ======= CREATE =======
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        addAddress.fulfilled,
        (state, action: PayloadAction<Address>) => {
          state.loading = false;
          state.addresses.push(action.payload);
          state.message = "Address added successfully.";
        }
      )
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ======= UPDATE =======
      .addCase(editAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        editAddress.fulfilled,
        (state, action: PayloadAction<Address>) => {
          state.loading = false;
          state.addresses = state.addresses.map((addr) =>
            addr.id === action.payload.id ? action.payload : addr
          );
          state.message = "Address updated successfully.";
        }
      )
      .addCase(editAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ======= DELETE =======
      .addCase(removeAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        removeAddress.fulfilled,
        (state, action: PayloadAction<{ id: number; message: string }>) => {
          state.loading = false;
          state.addresses = state.addresses.filter(
            (addr) => addr.id !== action.payload.id
          );
          state.message = action.payload.message;
        }
      )
      .addCase(removeAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAddressMessage } = addressSlice.actions;
export default addressSlice.reducer;
