import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchGroupCare,
  fetchMedicineByGenericId,
  fetchMedicinesAllList,
  fetchMenuMedicinesById,
  fetchMenuMedicinesByOtherId,
  fetchMenuMedicinesList,
  fetchMenuOtherMedicinesByCategory,
  fetchProductAllList,
  fetchProductByGenericId,
} from "@/lib/api/medicine";
import {
  CareGroup,
  CareGroupResponse,
  Medicine,
  MedicineResponse,
} from "@/types/medicine";

interface MedicineState {
  medicines: Medicine[];
  medicinesList: Medicine[];
  otherMedicines: Medicine[];
  groupCare: CareGroup[];
  genericAlternatives: Medicine[];
  genericAlternativesMedicines: Medicine[];
  count: number;
  loading: boolean;
  error: string | null;
  byCategory: Record<number, Medicine[]>;
}

const initialState: MedicineState = {
  medicines: [],
  medicinesList: [],
  otherMedicines: [],
  groupCare: [],
  genericAlternatives: [],
  genericAlternativesMedicines: [],
  count: 0,
  loading: false,
  error: null,
  byCategory: {},
};

// ✅ Get all medicines menu List
export const getMedicinesList = createAsyncThunk<
  MedicineResponse, // ✅ returning full object
  void,
  { rejectValue: string }
>("medicine/getAllList", async (_, { rejectWithValue }) => {
  try {
    const res: MedicineResponse = await fetchMedicinesAllList();
    return res; // ✅ return full response (includes success, count, data)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch medicines");
  }
});

// ✅ Get all medicines menu by id
export const getMedicinesMenuById = createAsyncThunk<
  MedicineResponse, // return type
  number, // argument type — yeh id hoga
  { rejectValue: string }
>("medicine/getById", async (id, { rejectWithValue }) => {
  try {
    const res: MedicineResponse = await fetchMenuMedicinesById(id);
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch medicines");
  }
});

// ✅ Get medicines by Other category ID
export const getMedicinesByCategoryId = createAsyncThunk<
  MedicineResponse,
  number,
  { rejectValue: string }
>(
  "medicine/getByCategory", // Action type string
  async (categoryId, { rejectWithValue }) => {
    try {
      const res: MedicineResponse = await fetchMenuOtherMedicinesByCategory(
        categoryId
      );
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to fetch category medicines");
    }
  }
);

// ✅ Get all medicines menu by other id
export const getMedicinesMenuByOtherId = createAsyncThunk<
  MedicineResponse,
  number,
  { rejectValue: string }
>("medicine/getByOtherId", async (id, { rejectWithValue }) => {
  try {
    const res: MedicineResponse = await fetchMenuMedicinesByOtherId(id);
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch medicines");
  }
});

// ✅ Get all medicine id by generic
export const getMedicineByGenericId = createAsyncThunk<
  MedicineResponse,
  number,
  { rejectValue: string }
>("medicine/getMedicineIdByGeneric", async (id, { rejectWithValue }) => {
  try {
    const res: MedicineResponse = await fetchMedicineByGenericId(id);
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch medicines");
  }
});

// ✅ Get all menu medicines List
export const getMenuMedicinesList = createAsyncThunk<
  MedicineResponse, // ✅ returning full object
  void,
  { rejectValue: string }
>("medicine/getMenuMedicineList", async (_, { rejectWithValue }) => {
  try {
    const res: MedicineResponse = await fetchMenuMedicinesList();
    return res; // ✅ return full response (includes success, count, data)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch medicines");
  }
});

// ✅ Get all product List
export const getProductList = createAsyncThunk<
  MedicineResponse, // ✅ returning full object
  void,
  { rejectValue: string }
>("medicine/getAllProductList", async (_, { rejectWithValue }) => {
  try {
    const res: MedicineResponse = await fetchProductAllList();
    return res; // ✅ return full response (includes success, count, data)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch medicines");
  }
});

// ✅ Get all product id by generic
export const getProductByGenericId = createAsyncThunk<
  MedicineResponse,
  number,
  { rejectValue: string }
>("medicine/getByProductId", async (id, { rejectWithValue }) => {
  try {
    const res: MedicineResponse = await fetchProductByGenericId(id);
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch medicines");
  }
});

// ✅ Get group care
export const getGroupCare = createAsyncThunk<
  CareGroupResponse, // ✅ returning full object
  void,
  { rejectValue: string }
>("medicine/getGroupCare", async (_, { rejectWithValue }) => {
  try {
    const res: CareGroupResponse = await fetchGroupCare();
    return res; // ✅ return full response (includes success, count, data)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch medicines");
  }
});

const medicineSlice = createSlice({
  name: "medicine",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch medicine list
      .addCase(getMedicinesList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMedicinesList.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines = action.payload.data;
        state.count = action.payload.count;
        state.error = null;
      })
      .addCase(getMedicinesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      // fetch menu medicine list
      .addCase(getMenuMedicinesList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMenuMedicinesList.fulfilled, (state, action) => {
        state.loading = false;
        state.medicinesList = action.payload.data;
        state.count = action.payload.count;
        state.error = null;
      })
      .addCase(getMenuMedicinesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      // fetch menu medicine by id
      .addCase(getMedicinesMenuById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMedicinesMenuById.fulfilled, (state, action) => {
        state.loading = false;
        state.medicinesList = action.payload.data;
        state.count = action.payload.count;
        state.error = null;
      })
      .addCase(getMedicinesMenuById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      // fetch medicine id by generic
      .addCase(getMedicineByGenericId.pending, (state) => {
        state.loading = true;
        state.genericAlternativesMedicines = [];
      })
      .addCase(getMedicineByGenericId.fulfilled, (state, action) => {
        state.loading = false;
        state.genericAlternativesMedicines = action.payload.data;
        state.count = action.payload.count;
        state.error = null;
      })
      .addCase(getMedicineByGenericId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      // fetch menu medicine by other id
      .addCase(getMedicinesMenuByOtherId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMedicinesMenuByOtherId.fulfilled, (state, action) => {
        state.loading = false;
        state.otherMedicines = action.payload.data;
        state.count = action.payload.count;
        state.error = null;
      })
      .addCase(getMedicinesMenuByOtherId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      // ✅ Get Medicines By Other Category
      .addCase(getMedicinesByCategoryId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicinesByCategoryId.fulfilled, (state, action) => {
        state.loading = false;
        state.byCategory[action.meta.arg] = action.payload.data; // categoryId as key
        state.error = null;
      })
      .addCase(getMedicinesByCategoryId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch medicines by category";
      })
      // fetch product list
      .addCase(getProductList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductList.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines = action.payload.data;
        state.count = action.payload.count;
        state.error = null;
      })
      .addCase(getProductList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      // fetch product id by generic
      .addCase(getProductByGenericId.pending, (state) => {
        state.loading = true;
        state.genericAlternatives = [];
      })
      .addCase(getProductByGenericId.fulfilled, (state, action) => {
        state.loading = false;
        state.genericAlternatives = action.payload.data;
        state.count = action.payload.count;
        state.error = null;
      })
      .addCase(getProductByGenericId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      // fetch group care
      .addCase(getGroupCare.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGroupCare.fulfilled, (state, action) => {
        state.loading = false;
        state.groupCare = action.payload.data;
        state.error = null;
      })
      .addCase(getGroupCare.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default medicineSlice.reducer;
