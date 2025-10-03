import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchManufacturerAll,
  fetchManufacturerAllList,
  //   updateManufacturerApi,
  //   createManufacturerApi,
} from "@/lib/api/manufacturer";
import { Manufacturer } from "@/types/manufacturer";

interface ManufacturerState {
  list: Manufacturer[];
  loading: boolean;
  error: string | null;
}

const initialState: ManufacturerState = {
  list: [],
  loading: false,
  error: null,
};

// ✅ Get all Manufacturers
export const getManufacturers = createAsyncThunk<
  Manufacturer[],
  void,
  { rejectValue: string }
>("manufacturer/getAll", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchManufacturerAll();
    return res.data as Manufacturer[];
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch manufacturers");
  }
});

// ✅ Get all Manufacturers
export const getManufacturersAllList = createAsyncThunk<
  Manufacturer[],
  void,
  { rejectValue: string }
>("manufacturer/getAllList", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchManufacturerAllList();
    return res.data as Manufacturer[];
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch manufacturers");
  }
});

// ✅ Create Manufacturer
// export const createManufacturer = createAsyncThunk<
//   Manufacturer,
//   {
//     Manufacturer_name: string;
//     status?: "Active" | "Inactive";
//   }, // ✅ status strict
//   { rejectValue: string }
// >("manufacturer/create", async (data, { rejectWithValue }) => {
//   try {
//     const newManufacturer = await createManufacturerApi(data); // ✅ ab type match
//     return newManufacturer;
//   } catch (err: unknown) {
//     if (err instanceof Error) return rejectWithValue(err.message);
//     return rejectWithValue("Failed to create Manufacturer");
//   }
// });

// ✅ Update Manufacturer
// export const updateManufacturer = createAsyncThunk<
//   Manufacturer,
//   {
//     id: number;
//     Manufacturer_name: string;
//     status?: "Active" | "Inactive";
//   }, // 👈 more fields allowed
//   { rejectValue: string }
// >("manufacturer/update", async (data, { rejectWithValue }) => {
//   try {
//     const updatedManufacturer = await updateManufacturerApi(data.id, {
//       Manufacturer_name: data.Manufacturer_name,
//       description: data.description,
//       status: data.status,
//     });
//     return updatedManufacturer;
//   } catch (err: unknown) {
//     if (err instanceof Error) return rejectWithValue(err.message);
//     return rejectWithValue("Failed to update Manufacturer");
//   }
// });

// ✅ Delete Manufacturer
// export const deleteManufacturer = createAsyncThunk<
//   number,
//   number,
//   { rejectValue: string }
// >("manufacturer/delete", async (id, { rejectWithValue }) => {
//   try {
//     await deleteManufacturerApi(id);
//     return id; // return deleted id
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       return rejectWithValue(err.message);
//     }
//     return rejectWithValue("Failed to delete Manufacturer");
//   }
// });

const ManufacturerSlice = createSlice({
  name: "Manufacturer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get
    builder
      .addCase(getManufacturers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getManufacturers.fulfilled,
        (state, action: PayloadAction<Manufacturer[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(getManufacturers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch manufacturers";
      });

    // Get All List
    builder
      .addCase(getManufacturersAllList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getManufacturersAllList.fulfilled,
        (state, action: PayloadAction<Manufacturer[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(getManufacturersAllList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch manufacturers";
      });

    // // Create
    // builder
    //   .addCase(
    //     createManufacturer.fulfilled,
    //     (state, action: PayloadAction<Manufacturer>) => {
    //       state.list.push(action.payload);
    //     }
    //   )
    //   .addCase(createManufacturer.rejected, (state, action) => {
    //     state.error = action.payload ?? "Failed to create Manufacturer";
    //   });

    // // Update
    // builder
    //   .addCase(
    //     updateManufacturer.fulfilled,
    //     (state, action: PayloadAction<Manufacturer>) => {
    //       if (!action.payload) return; // safeguard

    //       const index = state.list.findIndex(
    //         (cat) => cat.id === action.payload.id
    //       );
    //       if (index !== -1) state.list[index] = action.payload;
    //     }
    //   )

    //   .addCase(updateManufacturer.rejected, (state, action) => {
    //     state.error = action.payload ?? "Failed to update Manufacturer";
    //   });

    // // Delete
    // builder
    //   .addCase(
    //     deleteManufacturer.fulfilled,
    //     (state, action: PayloadAction<number>) => {
    //       state.list = state.list.filter((cat) => cat.id !== action.payload);
    //     }
    //   )
    //   .addCase(deleteManufacturer.rejected, (state, action) => {
    //     state.error = action.payload ?? "Failed to delete Manufacturer";
    //   });
  },
});

export default ManufacturerSlice.reducer;
