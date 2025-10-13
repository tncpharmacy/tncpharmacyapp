import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { buyerLoginApi, buyerRegisterApi } from "@/lib/api/buyer";
import { BuyerApiResponse, BuyerState } from "@/types/buyer";
import { loadBuyerFromToken } from "@/lib/utils/decodeToken";
import { safeLocalStorage } from "@/lib/utils/safeLocalStorage";
import toast from "react-hot-toast";

//
// 🔹 Initial Setup
//
const decodedBuyer = loadBuyerFromToken();

const initialState: BuyerState = {
  buyer: decodedBuyer
    ? {
        id: decodedBuyer.id,
        name: decodedBuyer.name,
        email: decodedBuyer.email,
        number: decodedBuyer.number,
      }
    : null,
  loading: false,
  error: null,
  otpSent: false,
  token: safeLocalStorage.getItem("buyerAccessToken"),
  userExists: null,
  registered: false,
  message: null,
  otpCode: null,
  lastLoginResponse: null, // ✅ Added for temporary storage
};

//
// 🔹 Thunks
//

// 1️⃣ Buyer Login (send OTP)
export const buyerLogin = createAsyncThunk<
  BuyerApiResponse,
  { login_id: string },
  { rejectValue: string }
>("buyer/login", async (payload, { rejectWithValue }) => {
  try {
    const res = await buyerLoginApi(payload);
    return res.data as BuyerApiResponse;
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any;
    return rejectWithValue(e.response?.data?.message || "Login failed");
  }
});

// 2️⃣ Buyer Register (send OTP)
export const buyerRegister = createAsyncThunk<
  BuyerApiResponse,
  { name: string; email: string; number: string },
  { rejectValue: string }
>("buyer/register", async (payload, { rejectWithValue }) => {
  try {
    const res = await buyerRegisterApi(payload);
    return res.data as BuyerApiResponse;
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any;
    return rejectWithValue(e.response?.data?.message || "Registration failed");
  }
});

// 3️⃣ OTP Verification (No API yet — use stored tokens)
export const verifyBuyerOtp = createAsyncThunk<
  BuyerApiResponse,
  { otp: string },
  { state: { buyer: BuyerState }; rejectValue: string }
>("buyer/verifyOtp", async (payload, { getState, rejectWithValue }) => {
  try {
    const state = getState().buyer;

    // Token pehle login/register response se aaya tha
    const tokens = state.lastLoginResponse?.data?.tokens;
    const serverOtp = state.lastLoginResponse?.data?.otp;

    if (!tokens) {
      return rejectWithValue("No tokens found in state");
    }

    if (serverOtp && serverOtp !== payload.otp) {
      return rejectWithValue("Invalid OTP");
    }

    // ✅ Proper response structure
    const verifiedResponse: BuyerApiResponse = {
      success: true,
      statusCode: 200,
      message: "OTP verified successfully",
      data: {
        tokens,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    };

    return verifiedResponse;
  } catch {
    return rejectWithValue("OTP verification failed");
  }
});

//
// 🔹 Slice
//
const buyerSlice = createSlice({
  name: "buyer",
  initialState,
  reducers: {
    buyerLogout: (state) => {
      safeLocalStorage.removeItem("buyerAccessToken");
      safeLocalStorage.removeItem("buyerRefreshToken");
      state.token = null;
      state.buyer = null;
      toast.success("Logged out successfully");
    },
    resetBuyerState: (state) => {
      state.loading = false;
      state.error = null;
      state.otpSent = false;
      state.userExists = null;
      state.registered = false;
      state.message = null;
      state.otpCode = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Buyer Login
      .addCase(buyerLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyerLogin.fulfilled, (state, action) => {
        state.loading = false;
        const { data, message } = action.payload;
        state.userExists = data?.existing ?? false;
        state.message = message ?? null;
        state.lastLoginResponse = action.payload; // ✅ store full response

        if (data?.otp) {
          state.otpCode = data.otp;
          state.otpSent = true;
          toast.success(`OTP sent: ${data.otp}`);
        }
      })
      .addCase(buyerLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      })

      // 🔹 Buyer Register
      .addCase(buyerRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyerRegister.fulfilled, (state, action) => {
        state.loading = false;
        const { data, message } = action.payload;
        state.message = message ?? null;
        state.registered = true;
        state.lastLoginResponse = action.payload; // ✅ store full response

        if (data?.otp) {
          state.otpCode = data.otp;
          state.otpSent = true;
          toast.success(`OTP sent: ${data.otp}`);
        }
      })
      .addCase(buyerRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      })

      // 🔹 OTP Verification
      .addCase(verifyBuyerOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyBuyerOtp.fulfilled, (state, action) => {
        state.loading = false;
        const tokens = action.payload.data?.tokens;

        if (tokens?.access && tokens?.refresh) {
          safeLocalStorage.setItem("buyerAccessToken", tokens.access);
          safeLocalStorage.setItem("buyerRefreshToken", tokens.refresh);
          state.token = tokens.access;

          const decoded = loadBuyerFromToken();
          if (decoded) {
            state.buyer = {
              id: decoded.id,
              name: decoded.name,
              email: decoded.email,
              number: decoded.number,
            };
          }

          toast.success("Login successful!");
        }
      })
      .addCase(verifyBuyerOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "OTP verification failed";
      });
  },
});

export const { buyerLogout, resetBuyerState } = buyerSlice.actions;
export default buyerSlice.reducer;
