import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { login } from "@/lib/auth/auth";
import { User } from "@/types/login";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  restoreComplete: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  restoreComplete: false,
};

// ✅ Login thunk
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { login_id, password }: { login_id: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await login(login_id, password);
      if (!data || !data.tokens) return rejectWithValue("Invalid response");

      const { tokens, user } = data;
      localStorage.setItem("accessToken", tokens.access);
      localStorage.setItem("refreshToken", tokens.refresh);
      localStorage.setItem("user", JSON.stringify(user));

      return { user, access: tokens.access, refresh: tokens.refresh };
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<Partial<AuthState>>) => {
      if (action.payload.user) state.user = action.payload.user;
      if (action.payload.accessToken)
        state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken)
        state.refreshToken = action.payload.refreshToken;

      state.isAuthenticated = !!action.payload.user;
      state.restoreComplete = true;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.restoreComplete = true;
      state.loading = false;
      state.error = null;
      localStorage.clear();
    },
    markRestoreComplete: (state) => {
      state.restoreComplete = true;
    },
    // 👇👇 Add this reducer
    clearState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.isAuthenticated = true;
        state.restoreComplete = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.restoreComplete = true;
      });
  },
});

export const { setCredentials, logout, markRestoreComplete, clearState } =
  authSlice.actions;
export default authSlice.reducer;
