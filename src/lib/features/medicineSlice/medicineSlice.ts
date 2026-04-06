import { Medicine } from "./../../../types/medicine";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createMedicine,
  deleteMedicineById,
  fetchCategoryIdBySubcategory,
  fetchGroupCare,
  fetchGroupCareById,
  fetchMedicineByGenericId,
  fetchMedicineListById,
  fetchMedicineListUpdate,
  fetchMedicinesAllList,
  fetchMedicinesViewById,
  fetchMedicineSearch,
  fetchMedicineSuggestion,
  fetchMenuMedicinesById,
  fetchMenuMedicinesByOtherId,
  fetchMenuMedicinesList,
  fetchMenuOtherMedicinesByCategory,
  fetchProductAllList,
  fetchProductByGenericId,
  updateMedicine,
  fetchMedicinesEditById,
  fetchMedicineByManufacturerId,
} from "@/lib/api/medicine";
import {
  CareGroup,
  CareGroupResponse,
  MedicineResponse,
} from "@/types/medicine";

// payload type for thunk
interface FetchCategoryPayload {
  categoryId: number;
  subCategoryId: number;
  url?: string;
}
interface MedicineState {
  medicine: MedicineResponse | null;
  medicines: Medicine[];
  medicinesList: Medicine[];
  groupCareList: Medicine[];
  groupName: string;
  otherMedicines: Medicine[];
  groupCare: CareGroup[];
  groupCareLoading: boolean;
  genericAlternatives: Medicine[];
  genericAlternativesMedicines: Medicine[];
  manufacturerAlternativesMedicines: Medicine[];
  count: number;
  loading: boolean;
  error: string | null;
  byCategory: Record<number, Medicine[]>;
  byCategorySubcategory: {
    [key: string]: Medicine[]; // ✅ dynamic keys allowed
  };
  selectedMedicine: Medicine | null;
  searchResults: Medicine[];
  suggestions: Medicine[];
  next: string | null;
}

const initialState: MedicineState = {
  medicine: null,
  medicines: [],
  medicinesList: [],
  groupCareList: [],
  groupName: "",
  otherMedicines: [],
  groupCare: [],
  groupCareLoading: false,
  genericAlternatives: [],
  genericAlternativesMedicines: [],
  manufacturerAlternativesMedicines: [],
  count: 0,
  loading: false,
  error: null,
  byCategory: {},
  byCategorySubcategory: {},
  selectedMedicine: null,
  searchResults: [],
  suggestions: [],
  next: null,
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
  { categoryId: number; url?: string },
  { rejectValue: string }
>(
  "medicine/getByCategory",
  async ({ categoryId, url }, { rejectWithValue }) => {
    try {
      const res = await fetchMenuOtherMedicinesByCategory(categoryId, url);
      return res;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getCategoryIdBySubcategory = createAsyncThunk<
  MedicineResponse,
  { categoryId: number; subCategoryId: number; url?: string },
  { rejectValue: string }
>(
  "medicine/getCategoryIdBySubcategory",
  async ({ categoryId, subCategoryId, url }, { rejectWithValue }) => {
    try {
      const res = await fetchCategoryIdBySubcategory(
        categoryId,
        subCategoryId,
        url // 🔥 important
      );
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to fetch medicines");
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
  { id: number; url?: string },
  { rejectValue: string }
>(
  "medicine/getMedicineIdByGeneric",
  async ({ id, url }, { rejectWithValue }) => {
    try {
      const res: MedicineResponse = await fetchMedicineByGenericId(id, url);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to fetch medicines");
    }
  }
);

// ✅ Get all medicine id by manufacturer
export const getMedicineByManufacturerId = createAsyncThunk<
  MedicineResponse,
  { id: number; url?: string },
  { rejectValue: string }
>(
  "medicine/getMedicineIdByManufacturer",
  async ({ id, url }, { rejectWithValue }) => {
    try {
      const res: MedicineResponse = await fetchMedicineByManufacturerId(
        id,
        url
      );

      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to fetch medicines");
    }
  }
);

// ✅ Get all menu medicines List
export const getMenuMedicinesList = createAsyncThunk<
  MedicineResponse,
  string | null,
  { rejectValue: string }
>("medicine/getMenuMedicineList", async (url, { rejectWithValue }) => {
  try {
    const res: MedicineResponse = await fetchMenuMedicinesList(
      url || undefined
    );
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch medicines");
  }
});

// ✅ Get all product List
export const getProductList = createAsyncThunk<
  MedicineResponse,
  string | null,
  { rejectValue: string }
>("medicine/getAllProductList", async (url, { rejectWithValue }) => {
  try {
    const res: MedicineResponse = await fetchProductAllList(url || undefined);
    return res;
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

// ✅ Get all medicine id by generic
export const getGroupCareById = createAsyncThunk<
  MedicineResponse,
  number,
  { rejectValue: string }
>("medicine/getGroupCareById", async (groupId, { rejectWithValue }) => {
  try {
    const res: MedicineResponse = await fetchGroupCareById(groupId);
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Failed to fetch medicines");
  }
});

// ✅ Get medicine list by ID
export const getMedicineListById = createAsyncThunk<
  MedicineResponse,
  number,
  { rejectValue: string }
>("medicine/getMedicineListById", async (id, { rejectWithValue }) => {
  try {
    const res = await fetchMedicineListById(id);
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) return rejectWithValue(err.message);
    return rejectWithValue("Failed to fetch medicine list by ID");
  }
});

// ✅ Update medicine list by ID
export const updateMedicineListById = createAsyncThunk(
  "medicine/updateMedicineListById",
  async ({ id, data }: { id: number; data: FormData }, { rejectWithValue }) => {
    try {
      return await fetchMedicineListUpdate(id, data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Data is not successfully updated");
    }
  }
);
// Search text
export const searchMedicines = createAsyncThunk<
  MedicineResponse,
  string,
  { rejectValue: string }
>("medicine/search", async (text, { rejectWithValue }) => {
  try {
    const res = await fetchMedicineSearch(text);
    return res;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(err.message || "Search failed");
  }
});

// Search suggestion
export const getSearchSuggestions = createAsyncThunk<
  MedicineResponse,
  string,
  { rejectValue: string }
>("medicine/suggestion", async (query, { rejectWithValue }) => {
  try {
    const res = await fetchMedicineSuggestion(query);
    return res;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return rejectWithValue(err.message || "Suggestion fetch failed");
  }
});

// get medicine view by id
export const getMedicineViewByIdThunk = createAsyncThunk(
  "medicine/medicineGetViewById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchMedicinesViewById(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch medicine"
      );
    }
  }
);

// get medicine edit by id
export const getMedicineEditByIdThunk = createAsyncThunk(
  "medicine/medicineGetEditById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchMedicinesEditById(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch medicine"
      );
    }
  }
);

// create medicine
export const createMedicineThunk = createAsyncThunk<
  MedicineResponse,
  FormData,
  { rejectValue: string }
>("medicine/create", async (payload, { rejectWithValue }) => {
  try {
    return await createMedicine(payload);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create medicine"
    );
  }
});

// update medicine
export const updateMedicineThunk = createAsyncThunk<
  MedicineResponse,
  { id: number; data: FormData },
  { rejectValue: string }
>("medicine/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await updateMedicine(id, data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update medicine"
    );
  }
});

// delete medicine
export const deleteMedicineThunk = createAsyncThunk(
  "medicine/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteMedicineById(id);
      return id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete medicine"
      );
    }
  }
);

const medicineSlice = createSlice({
  name: "medicine",
  initialState,
  reducers: {
    clearSelectedMedicine: (state) => {
      state.selectedMedicine = null;
      state.medicinesList = []; // ✅ optional, agar form list bhi clear karni ho
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    resetMedicinesList: (state) => {
      state.medicinesList = [];
      state.next = null;
    },
  },
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

        const safeCurrent = Array.isArray(state.medicinesList)
          ? state.medicinesList
          : [];

        const safeIncoming = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];

        state.medicinesList = !action.meta.arg
          ? safeIncoming
          : [...safeCurrent, ...safeIncoming];

        state.next = action.payload.next;
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
        // state.genericAlternativesMedicines = [];
      })
      .addCase(getMedicineByGenericId.fulfilled, (state, action) => {
        state.loading = false;

        const safeCurrent = Array.isArray(state.genericAlternativesMedicines)
          ? state.genericAlternativesMedicines
          : [];

        const safeIncoming = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];

        const isLoadMore =
          action.meta.arg.url !== undefined && action.meta.arg.url !== null;

        const combined = isLoadMore
          ? [...safeCurrent, ...safeIncoming] // 🔥 append
          : safeIncoming; // first load

        state.genericAlternativesMedicines = combined;

        state.next = action.payload.next;
        state.count = action.payload.count;
        state.error = null;
      })
      .addCase(getMedicineByGenericId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      // fetch medicine id by manufacturer
      .addCase(getMedicineByManufacturerId.pending, (state) => {
        state.loading = true;
        // state.manufacturerAlternativesMedicines = [];
      })
      .addCase(getMedicineByManufacturerId.fulfilled, (state, action) => {
        state.loading = false;

        const safeCurrent = Array.isArray(
          state.manufacturerAlternativesMedicines
        )
          ? state.manufacturerAlternativesMedicines
          : [];

        const safeIncoming = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];

        const isLoadMore =
          action.meta.arg.url !== undefined && action.meta.arg.url !== null;

        const combined = isLoadMore
          ? [...safeCurrent, ...safeIncoming] // 🔥 append
          : safeIncoming; // first load

        state.manufacturerAlternativesMedicines = combined;

        state.next = action.payload.next;
        state.count = action.payload.count;
        state.error = null;
      })
      .addCase(getMedicineByManufacturerId.rejected, (state, action) => {
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
        const { categoryId, url } = action.meta.arg;

        const existing = state.byCategory[categoryId] || [];

        state.byCategory[categoryId] = url
          ? [...existing, ...action.payload.data] // 🔥 append
          : action.payload.data; // first load

        state.next = action.payload.next;
      })
      .addCase(getMedicinesByCategoryId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch medicines by category";
      })
      // fetch product list
      .addCase(getProductList.fulfilled, (state, action) => {
        state.loading = false;

        const safeCurrent = Array.isArray(state.medicines)
          ? state.medicines
          : [];

        const safeIncoming = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];

        state.medicines = !action.meta.arg
          ? safeIncoming
          : [...safeCurrent, ...safeIncoming];

        state.next = action.payload.next; // ⭐ important
        state.count = action.payload.count;
        state.error = null;
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
      // fetch category Id By sub category
      .addCase(getCategoryIdBySubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoryIdBySubcategory.fulfilled, (state, action) => {
        state.loading = false;

        const { categoryId, subCategoryId, url } = action.meta.arg;
        const key = `${categoryId}-${subCategoryId}`;

        const existing = state.byCategorySubcategory[key] || [];

        state.byCategorySubcategory[key] = url
          ? [...existing, ...action.payload.data] // 🔥 append
          : action.payload.data; // first load

        state.next = action.payload.next; // 🔥 VERY IMPORTANT
        state.error = null;
      })
      .addCase(getCategoryIdBySubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      // Get group care
      .addCase(getGroupCare.pending, (state) => {
        state.groupCareLoading = true;
      })
      .addCase(getGroupCare.fulfilled, (state, action) => {
        state.groupCareLoading = false;
        state.groupCare = action.payload.data;
        state.error = null;
      })
      .addCase(getGroupCare.rejected, (state, action) => {
        state.groupCareLoading = false;
        state.error = action.payload || "Something went wrong";
      })

      // ✅ Get group care by ID
      .addCase(getGroupCareById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGroupCareById.fulfilled, (state, action) => {
        state.loading = false;
        state.groupCareList = action.payload.data;
        state.groupName = action.payload.group_name;
        state.error = null;
      })
      .addCase(getGroupCareById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Something went wrong while fetching by ID";
      })
      // ✅ Get medicine list by ID
      .addCase(getMedicineListById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMedicineListById.fulfilled, (state, action) => {
        state.loading = false;
        state.medicinesList = action.payload.data;
        state.count = action.payload.count;
        state.error = null;
      })
      .addCase(getMedicineListById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Something went wrong while fetching by ID";
      })

      // ✅ Update medicine list by ID
      .addCase(updateMedicineListById.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMedicineListById.fulfilled, (state, action) => {
        state.loading = false;
        state.medicinesList = action.payload.data;
        state.count = action.payload.count;
        state.error = null;
      })
      .addCase(updateMedicineListById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Search Text
      .addCase(searchMedicines.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchMedicines.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data;
        state.error = null;
      })
      .addCase(searchMedicines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Search failed";
      })

      // Search Suggestion
      .addCase(getSearchSuggestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSearchSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload.data;
        state.error = null;
      })
      .addCase(getSearchSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Suggestion fetch failed";
      })

      // GET MEDICINE VIEW BY ID
      .addCase(getMedicineViewByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicineViewByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.medicine = action.payload;
      })
      .addCase(getMedicineViewByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // GET MEDICINE EDIT BY ID
      .addCase(getMedicineEditByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicineEditByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.medicine = action.payload;
      })
      .addCase(getMedicineEditByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // CREATE MEDICINE
      .addCase(createMedicineThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMedicineThunk.fulfilled, (state, action) => {
        state.loading = false;

        const newMedicine = action.payload.data[0]; // ✅ FIRST ITEM

        state.medicine = action.payload; // MedicineResponse
        state.medicinesList.unshift(newMedicine); // Medicine
      })
      .addCase(createMedicineThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // UPDATE MEDICINE
      .addCase(updateMedicineThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMedicineThunk.fulfilled, (state, action) => {
        state.loading = false;

        const updatedMedicine = action.payload.data[0]; // ✅ FIRST ITEM

        state.medicine = action.payload;

        const index = state.medicinesList.findIndex(
          (m) => m.id === updatedMedicine.id
        );

        if (index !== -1) {
          state.medicinesList[index] = updatedMedicine; // ✅ Medicine
        }
      })
      // DELETE MEDICINE
      .addCase(deleteMedicineThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMedicineThunk.fulfilled, (state, action) => {
        state.loading = false;

        const deletedId = action.payload;

        // list se hatao
        state.medicinesList = state.medicinesList.filter(
          (m) => m.id !== deletedId
        );

        // single view clear karo
        if (state.medicine?.data?.[0]?.id === deletedId) {
          state.medicine = null;
        }
      })
      .addCase(deleteMedicineThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedMedicine, clearSearchResults, resetMedicinesList } =
  medicineSlice.actions;
export default medicineSlice.reducer;
