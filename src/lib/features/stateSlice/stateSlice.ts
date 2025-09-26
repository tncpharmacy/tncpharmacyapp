// redux/slices/stateSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getStates } from "@/lib/api/state";

interface StateData {
  id: number;
  state_name: string;
}

interface StateSlice {
  states: StateData[];
  loading: boolean;
  error: string | null;
}

const initialState: StateSlice = {
  states: [], // 👈 yaha [] rakho, null ya {} nahi
  loading: false,
  error: null,
};

export const fetchStates = createAsyncThunk("states/fetch", async () => {
  const data = await getStates();
  return data;
});

const stateSlice = createSlice({
  name: "states",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchStates.pending, (state) => {
      state.loading = true;
    });
    builder
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload?.data || []; // 👈 array assign karo
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching states";
      });
  },
});

export default stateSlice.reducer;
