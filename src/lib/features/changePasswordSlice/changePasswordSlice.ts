// src/store/actions/changePassword.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updatePassword } from "@/lib/api/changePassword";
import { PasswordPayload, PasswordResponse } from "@/types/changePassword";

interface PasswordState {
  loading: boolean;
  error: string | null;
  result: PasswordResponse | null;
}

const initialState: PasswordState = {
  loading: false,
  error: null,
  result: null,
};

export const changePassword = createAsyncThunk<
  PasswordResponse, // ✔ return type
  PasswordPayload, // ✔ argument type
  { rejectValue: string } // ✔ rejection type
>(
  "auth/changePassword",
  async ({ userId, userTypeId, data }, { rejectWithValue }) => {
    try {
      return await updatePassword(userId, userTypeId, data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to update password"
      );
    }
  }
);

const changePasswordSlice = createSlice({
  name: "password",
  initialState,
  reducers: {
    resetPasswordState: (state) => {
      state.loading = false;
      state.error = null;
      state.result = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.result = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload; // ✔ success + statusCode + message
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update password";
      });
  },
});

export const { resetPasswordState } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;
