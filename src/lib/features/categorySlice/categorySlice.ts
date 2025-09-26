import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchCategories,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "@/lib/api/category";
import { Category } from "@/types/category";

interface CategoryState {
  list: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  list: [],
  loading: false,
  error: null,
};

// ✅ Get all categories
export const getCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("category/getAll", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchCategories();
    return res.data as Category[];
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch categories");
  }
});

// ✅ Create category
export const createCategory = createAsyncThunk<
  Category,
  { category_name: string }, // correct field
  { rejectValue: string }
>("category/create", async (data, { rejectWithValue }) => {
  try {
    // createCategoryApi directly Category return karta hai
    const newCategory = await createCategoryApi(data);

    // ✅ directly return the created Category
    return newCategory;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to create category");
  }
});

// ✅ Update category
export const updateCategory = createAsyncThunk<
  Category, // return type of the thunk
  { id: number; category_name: string }, // argument type
  { rejectValue: string } // reject value type
>("category/update", async (data, { rejectWithValue }) => {
  try {
    // updateCategoryApi ab directly Category return karta hai
    const updatedCategory = await updateCategoryApi(data.id, {
      category_name: data.category_name,
    });

    // ✅ directly return updated Category
    return updatedCategory;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to update category");
  }
});

// ✅ Delete category
export const deleteCategory = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("category/delete", async (id, { rejectWithValue }) => {
  try {
    await deleteCategoryApi(id);
    return id; // return deleted id
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to delete category");
  }
});

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get
    builder
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch categories";
      });

    // Create
    builder
      .addCase(
        createCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.list.push(action.payload);
        }
      )
      .addCase(createCategory.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to create category";
      });

    // Update
    builder
      .addCase(
        updateCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          const index = state.list.findIndex(
            (cat) => cat.id === action.payload.id
          );
          if (index !== -1) {
            state.list[index] = action.payload;
          }
        }
      )
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to update category";
      });

    // Delete
    builder
      .addCase(
        deleteCategory.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.list = state.list.filter((cat) => cat.id !== action.payload);
        }
      )
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to delete category";
      });
  },
});

export default categorySlice.reducer;
