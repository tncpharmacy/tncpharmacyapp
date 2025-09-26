import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchSubcategories,
  createSubcategoryApi,
  updateSubcategoryApi,
  deleteSubcategoryApi,
} from "@/lib/api/subCategory";
import { SubCategory, SubCategoryResponse } from "@/types/subCategory";

interface SubCategoryState {
  list: SubCategory[];
  loading: boolean;
  error: string | null;
}

const initialState: SubCategoryState = {
  list: [],
  loading: false,
  error: null,
};

// GET ALL
export const getSubcategories = createAsyncThunk<
  SubCategory[],
  void,
  { rejectValue: string }
>("subcategory/getAll", async (_, { rejectWithValue }) => {
  try {
    const res: SubCategoryResponse = await fetchSubcategories();
    return res.data;
  } catch (err: unknown) {
    if (err instanceof Error) return rejectWithValue(err.message);
    return rejectWithValue("Failed to fetch subcategories");
  }
});

// CREATE
export const createSubcategory = createAsyncThunk<
  SubCategory,
  {
    sub_category_name: string;
    category_id: number;
    description?: string;
    status?: "Active" | "Inactive";
  },
  { rejectValue: string }
>("subcategory/create", async (data, { rejectWithValue }) => {
  try {
    const res = await createSubcategoryApi(data);
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) return rejectWithValue(err.message);
    return rejectWithValue("Failed to create subcategory");
  }
});

// UPDATE
export const updateSubcategory = createAsyncThunk<
  SubCategory,
  {
    id: number;
    sub_category_name?: string;
    category_id?: number;
    description?: string;
    status?: "Active" | "Inactive";
  },
  { rejectValue: string }
>("subcategory/update", async (data, { rejectWithValue }) => {
  try {
    const res = await updateSubcategoryApi(data.id, data);
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) return rejectWithValue(err.message);
    return rejectWithValue("Failed to update subcategory");
  }
});

// DELETE
export const deleteSubcategory = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("subcategory/delete", async (id, { rejectWithValue }) => {
  try {
    await deleteSubcategoryApi(id);
    return id;
  } catch (err: unknown) {
    if (err instanceof Error) return rejectWithValue(err.message);
    return rejectWithValue("Failed to delete subcategory");
  }
});

const subcategorySlice = createSlice({
  name: "subcategory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET
    builder
      .addCase(getSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getSubcategories.fulfilled,
        (state, action: PayloadAction<SubCategory[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(getSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch subcategories";
      });

    // CREATE
    builder
      .addCase(
        createSubcategory.fulfilled,
        (state, action: PayloadAction<SubCategory>) => {
          state.list.push(action.payload);
        }
      )
      .addCase(createSubcategory.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to create subcategory";
      });

    // UPDATE
    builder
      .addCase(
        updateSubcategory.fulfilled,
        (state, action: PayloadAction<SubCategory>) => {
          const index = state.list.findIndex(
            (sub) => sub.id === action.payload.id
          );
          if (index !== -1) state.list[index] = action.payload;
        }
      )
      .addCase(updateSubcategory.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to update subcategory";
      });

    // DELETE
    builder
      .addCase(
        deleteSubcategory.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.list = state.list.filter((sub) => sub.id !== action.payload);
        }
      )
      .addCase(deleteSubcategory.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to delete subcategory";
      });
  },
});

export default subcategorySlice.reducer;
