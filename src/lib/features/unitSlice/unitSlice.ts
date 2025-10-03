import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchUnitAll,
  fetchUnitAllList,
  //   updateUnitApi,
  //   createUnitApi,
} from "@/lib/api/unit";
import { Unit } from "@/types/unit";

interface UnitState {
  list: Unit[];
  loading: boolean;
  error: string | null;
}

const initialState: UnitState = {
  list: [],
  loading: false,
  error: null,
};

// ✅ Get all Units
export const getUnits = createAsyncThunk<Unit[], void, { rejectValue: string }>(
  "unit/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchUnitAll();
      return res.data as Unit[];
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to fetch Units");
    }
  }
);

// ✅ Get all Units
export const getUnitsAllList = createAsyncThunk<
  Unit[],
  void,
  { rejectValue: string }
>("unit/getAllList", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchUnitAllList();
    return res.data as Unit[];
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch Units");
  }
});

// ✅ Create Unit
// export const createUnit = createAsyncThunk<
//   Unit,
//   {
//     Unit_name: string;
//     status?: "Active" | "Inactive";
//   }, // ✅ status strict
//   { rejectValue: string }
// >("unit/create", async (data, { rejectWithValue }) => {
//   try {
//     const newUnit = await createUnitApi(data); // ✅ ab type match
//     return newUnit;
//   } catch (err: unknown) {
//     if (err instanceof Error) return rejectWithValue(err.message);
//     return rejectWithValue("Failed to create Unit");
//   }
// });

// ✅ Update Unit
// export const updateUnit = createAsyncThunk<
//   Unit,
//   {
//     id: number;
//     Unit_name: string;
//     status?: "Active" | "Inactive";
//   }, // 👈 more fields allowed
//   { rejectValue: string }
// >("unit/update", async (data, { rejectWithValue }) => {
//   try {
//     const updatedUnit = await updateUnitApi(data.id, {
//       Unit_name: data.Unit_name,
//       description: data.description,
//       status: data.status,
//     });
//     return updatedUnit;
//   } catch (err: unknown) {
//     if (err instanceof Error) return rejectWithValue(err.message);
//     return rejectWithValue("Failed to update Unit");
//   }
// });

// ✅ Delete Unit
// export const deleteUnit = createAsyncThunk<
//   number,
//   number,
//   { rejectValue: string }
// >("unit/delete", async (id, { rejectWithValue }) => {
//   try {
//     await deleteUnitApi(id);
//     return id; // return deleted id
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       return rejectWithValue(err.message);
//     }
//     return rejectWithValue("Failed to delete Unit");
//   }
// });

const UnitSlice = createSlice({
  name: "Unit",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get
    builder
      .addCase(getUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUnits.fulfilled, (state, action: PayloadAction<Unit[]>) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch Units";
      });

    // Get All List
    builder
      .addCase(getUnitsAllList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getUnitsAllList.fulfilled,
        (state, action: PayloadAction<Unit[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(getUnitsAllList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch Units";
      });

    // // Create
    // builder
    //   .addCase(
    //     createUnit.fulfilled,
    //     (state, action: PayloadAction<Unit>) => {
    //       state.list.push(action.payload);
    //     }
    //   )
    //   .addCase(createUnit.rejected, (state, action) => {
    //     state.error = action.payload ?? "Failed to create Unit";
    //   });

    // // Update
    // builder
    //   .addCase(
    //     updateUnit.fulfilled,
    //     (state, action: PayloadAction<Unit>) => {
    //       if (!action.payload) return; // safeguard

    //       const index = state.list.findIndex(
    //         (cat) => cat.id === action.payload.id
    //       );
    //       if (index !== -1) state.list[index] = action.payload;
    //     }
    //   )

    //   .addCase(updateUnit.rejected, (state, action) => {
    //     state.error = action.payload ?? "Failed to update Unit";
    //   });

    // // Delete
    // builder
    //   .addCase(
    //     deleteUnit.fulfilled,
    //     (state, action: PayloadAction<number>) => {
    //       state.list = state.list.filter((cat) => cat.id !== action.payload);
    //     }
    //   )
    //   .addCase(deleteUnit.rejected, (state, action) => {
    //     state.error = action.payload ?? "Failed to delete Unit";
    //   });
  },
});

export default UnitSlice.reducer;
