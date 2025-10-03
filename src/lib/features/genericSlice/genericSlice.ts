import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchGenericAll,
  fetchGenericAllList,
  //   updateGenericApi,
  //   createGenericApi,
} from "@/lib/api/generic";
import { Generic } from "@/types/generic";

interface GenericState {
  list: Generic[];
  loading: boolean;
  error: string | null;
}

const initialState: GenericState = {
  list: [],
  loading: false,
  error: null,
};

// ✅ Get all generics
export const getGenerics = createAsyncThunk<
  Generic[],
  void,
  { rejectValue: string }
>("generic/getAll", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchGenericAll();
    return res.data as Generic[];
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch generics");
  }
});

// ✅ Get all generics
export const getGenericsAllList = createAsyncThunk<
  Generic[],
  void,
  { rejectValue: string }
>("generic/getAllList", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchGenericAllList();
    return res.data as Generic[];
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch generics");
  }
});

// ✅ Create Generic
// export const createGeneric = createAsyncThunk<
//   Generic,
//   {
//     generic_name: string;
//     status?: "Active" | "Inactive";
//   }, // ✅ status strict
//   { rejectValue: string }
// >("generic/create", async (data, { rejectWithValue }) => {
//   try {
//     const newGeneric = await createGenericApi(data); // ✅ ab type match
//     return newGeneric;
//   } catch (err: unknown) {
//     if (err instanceof Error) return rejectWithValue(err.message);
//     return rejectWithValue("Failed to create Generic");
//   }
// });

// ✅ Update Generic
// export const updateGeneric = createAsyncThunk<
//   Generic,
//   {
//     id: number;
//     generic_name: string;
//     status?: "Active" | "Inactive";
//   }, // 👈 more fields allowed
//   { rejectValue: string }
// >("generic/update", async (data, { rejectWithValue }) => {
//   try {
//     const updatedGeneric = await updateGenericApi(data.id, {
//       Generic_name: data.Generic_name,
//       description: data.description,
//       status: data.status,
//     });
//     return updatedGeneric;
//   } catch (err: unknown) {
//     if (err instanceof Error) return rejectWithValue(err.message);
//     return rejectWithValue("Failed to update Generic");
//   }
// });

// ✅ Delete Generic
// export const deleteGeneric = createAsyncThunk<
//   number,
//   number,
//   { rejectValue: string }
// >("generic/delete", async (id, { rejectWithValue }) => {
//   try {
//     await deleteGenericApi(id);
//     return id; // return deleted id
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       return rejectWithValue(err.message);
//     }
//     return rejectWithValue("Failed to delete Generic");
//   }
// });

const GenericSlice = createSlice({
  name: "Generic",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get
    builder
      .addCase(getGenerics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getGenerics.fulfilled,
        (state, action: PayloadAction<Generic[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(getGenerics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch generics";
      });

    // Get All List
    builder
      .addCase(getGenericsAllList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getGenericsAllList.fulfilled,
        (state, action: PayloadAction<Generic[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(getGenericsAllList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch generics";
      });

    // // Create
    // builder
    //   .addCase(
    //     createGeneric.fulfilled,
    //     (state, action: PayloadAction<Generic>) => {
    //       state.list.push(action.payload);
    //     }
    //   )
    //   .addCase(createGeneric.rejected, (state, action) => {
    //     state.error = action.payload ?? "Failed to create Generic";
    //   });

    // // Update
    // builder
    //   .addCase(
    //     updateGeneric.fulfilled,
    //     (state, action: PayloadAction<Generic>) => {
    //       if (!action.payload) return; // safeguard

    //       const index = state.list.findIndex(
    //         (cat) => cat.id === action.payload.id
    //       );
    //       if (index !== -1) state.list[index] = action.payload;
    //     }
    //   )

    //   .addCase(updateGeneric.rejected, (state, action) => {
    //     state.error = action.payload ?? "Failed to update Generic";
    //   });

    // // Delete
    // builder
    //   .addCase(
    //     deleteGeneric.fulfilled,
    //     (state, action: PayloadAction<number>) => {
    //       state.list = state.list.filter((cat) => cat.id !== action.payload);
    //     }
    //   )
    //   .addCase(deleteGeneric.rejected, (state, action) => {
    //     state.error = action.payload ?? "Failed to delete Generic";
    //   });
  },
});

export default GenericSlice.reducer;
