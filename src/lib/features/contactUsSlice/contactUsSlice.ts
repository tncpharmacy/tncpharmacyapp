import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchContactUs,
  fetchContactById,
  deleteContact,
  createContactForm,
} from "@/lib/api/contactUs";
import { ContactItem } from "@/types/contactUs";

// =============== ASYNC THUNKS ===============

// Fetch all contact entries
export const getAllContacts = createAsyncThunk(
  "contactUs/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchContactUs();
      return res.data; // array of ContactItem[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch single contact details
export const getContactById = createAsyncThunk(
  "contactUs/getById",
  async (contactId: number, { rejectWithValue }) => {
    try {
      return await fetchContactById(contactId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create contact item
export const addContactForm = createAsyncThunk(
  "contactUs/create",
  async (
    payload: {
      name: string;
      email: string;
      number: string;
      subject: string;
      contact_summary: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await createContactForm(payload);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete contact item
export const removeContact = createAsyncThunk(
  "contactUs/delete",
  async (contactId: number, { rejectWithValue }) => {
    try {
      await deleteContact(contactId);
      return contactId; // return ID to update local store
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// =============== SLICE ===============

interface ContactUsState {
  list: ContactItem[];
  selected: ContactItem | null;
  loading: boolean;
  error: string | null;
}

const initialState: ContactUsState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
};

const contactUsSlice = createSlice({
  name: "contactUs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET ALL
    builder.addCase(getAllContacts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllContacts.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload;
    });
    builder.addCase(getAllContacts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // GET BY ID
    builder.addCase(getContactById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getContactById.fulfilled, (state, action) => {
      state.loading = false;
      state.selected = action.payload;
    });
    builder.addCase(getContactById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // CREATE CONTACT FORM
    builder.addCase(addContactForm.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addContactForm.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(addContactForm.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // DELETE
    builder.addCase(removeContact.fulfilled, (state, action) => {
      state.list = state.list.filter((item) => item.id !== action.payload);
    });
  },
});

// Export reducer
export default contactUsSlice.reducer;
