import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchAddress, createAddress, deleteAddress } from "@/lib/api/address"; // adjust path
import { Address, AddressResponse } from "@/types/address";

// ===============================
// SLICE
// ===============================
interface AddressState {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: AddressState = {
  addresses: [],
  loading: false,
  error: null,
  message: null,
};

// ===============================
// ASYNC THUNKS
// ===============================
export const getAddress = createAsyncThunk(
  "address/fetch",
  async (buyerId: number, { rejectWithValue }) => {
    try {
      const response = await fetchAddress(buyerId);
      return response;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to fetch address");
    }
  }
);

export const addAddress = createAsyncThunk(
  "address/create",
  async (data: Address, { rejectWithValue }) => {
    try {
      const response = await createAddress(data);
      return response;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to fetch address");
    }
  }
);

export const removeAddress = createAsyncThunk(
  "address/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await deleteAddress(id);
      return { id, ...response };
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to fetch address");
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
      // ======= FETCH =======
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

      // ======= CREATE =======
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        addAddress.fulfilled,
        (state, action: PayloadAction<Address>) => {
          state.loading = false;
          state.addresses.push(action.payload);
          state.message = "Item added successfully.";
        }
      )
      .addCase(addAddress.rejected, (state, action) => {
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
