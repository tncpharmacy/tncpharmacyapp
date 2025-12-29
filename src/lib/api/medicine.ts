import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import {
  CareGroupResponse,
  Medicine,
  MedicineResponse,
} from "@/types/medicine";
// =========================
// GET ALL MEDICINES List
// =========================
export const fetchMedicinesAllList = async (): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_ALL_LIST
  );
  return res.data; // ✅ res.data is now MedicineResponse
};
// =========================
// GET ALL MEDICINES MENU List
// =========================
export const fetchMenuMedicinesList = async (): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_MENU_MEDICINE
  );
  return res.data; // ✅ res.data is now MedicineResponse
};
// =========================
// GET GET BY MENU ID
// =========================
export const fetchMenuMedicinesById = async (
  id: number
): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_BY_MENU_ID(id)
  );
  return res.data; // ✅ res.data is now MedicineResponse
};
// =========================
// GET MENU OTHER MEDICINE
// =========================
export const fetchMenuOtherMedicinesByCategory = async (
  categoryId: number
): Promise<MedicineResponse> => {
  const url = ENDPOINTS.MEDICINES.GET_MENU_OTHER_MEDICINE(categoryId);
  const res = await axiosInstance.get<MedicineResponse>(url);
  return res.data;
};
// =========================
// GET GET BY MENU OTHER ID
// =========================
export const fetchMenuMedicinesByOtherId = async (
  id: number
): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_BY_MENU_OTHER_ID(id)
  );
  return res.data; // ✅ res.data is now MedicineResponse
};
// =========================
// GET MEDICINE ID BY GENERIC
// =========================
export const fetchMedicineByGenericId = async (
  medicineId: number
): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_MEDICINE_LIST_BY_GENERIC(medicineId)
  );
  return res.data; // ✅ res.data is now MedicineResponse
};
// =========================
// GET ALL PRODUCT List
// =========================
export const fetchProductAllList = async (): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_ALL_PRODUCT_LIST
  );
  return res.data; // ✅ res.data is now MedicineResponse
};
// =========================
// GET BY PRODUCT ID
// =========================
export const fetchProductByGenericId = async (
  productId: number
): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_PRODUCT_LIST_BY_GENERIC(productId)
  );
  return res.data; // ✅ res.data is now MedicineResponse
};
// =================================
// GET BY CATEGORY ID BY SUBCATEGORY
// =================================
export const fetchCategoryIdBySubcategory = async (
  categoryId: number,
  subCategoryId: number
): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_CATEGORY_ID_BY_SUBCATEGORY(
      categoryId,
      subCategoryId
    )
  );
  return res.data; // ✅ res.data is now MedicineResponse
};
// =========================
// GET GROUP CARE
// =========================
export const fetchGroupCare = async (): Promise<CareGroupResponse> => {
  const res = await axiosInstance.get<CareGroupResponse>(
    ENDPOINTS.MEDICINES.GET_GROUP_CARE
  );
  return res.data; // ✅ res.data is now MedicineResponse
};
// =========================
// GET GROUP CARE BY ID
// =========================
export const fetchGroupCareById = async (
  groupId: number
): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_GROUP_CARE_BY_ID(groupId)
  );
  return res.data;
};

// =========================
// GET MEDICINE LIST BY ID
// =========================
export const fetchMedicineListById = async (
  id: number
): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_MEDICINE_LIST_BY_ID(id)
  );
  return res.data;
};

// ============================
// UPDATE MEDICINE LIST UPDATE
// ============================

export const fetchMedicineListUpdate = async (
  id: number | string,
  data: Partial<MedicineResponse> | FormData
): Promise<MedicineResponse> => {
  const res = await axiosInstance.put<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_MEDICINE_LIST_UPDATE(id),
    data,
    {
      headers:
        data instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : {},
    }
  );
  return res.data;
};

// =========================
// SEARCH MEDICINES
// =========================
export const fetchMedicineSearch = async (
  text: string
): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.SEARCH(text)
  );
  return res.data;
};

// =========================
// SEARCH SUGGESTION
// =========================
export const fetchMedicineSuggestion = async (
  query: string
): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.SEARCH_SUGGESTION(query)
  );
  return res.data;
};

// =========================
//  GET MEDICINE VIEW BY ID
// =========================
export const fetchMedicinesViewById = async (
  id: number
): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_MEDICINE_VIEW_BY_ID(id)
  );
  return res.data; // ✅ res.data is now MedicineResponse
};

// =========================
//  GET MEDICINE EDIT BY ID
// =========================
export const fetchMedicinesEditById = async (
  id: number
): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_MEDICINE_EDIT_BY_ID(id)
  );
  return res.data; // ✅ res.data is now MedicineResponse
};

// =========================
//  CREATE MEDICINE
// =========================
export const createMedicine = async (
  payload: FormData
): Promise<MedicineResponse> => {
  const res = await axiosInstance.post<MedicineResponse>(
    ENDPOINTS.MEDICINES.CREATE,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

// =========================
//  UPDATE MEDICINE
// =========================
export const updateMedicine = async (
  id: number,
  payload: FormData
): Promise<MedicineResponse> => {
  const res = await axiosInstance.put<MedicineResponse>(
    ENDPOINTS.MEDICINES.UPDATE(id),
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

// =========================
//  DELETE MEDICINE
// =========================
export const deleteMedicineById = async (
  id: number
): Promise<MedicineResponse> => {
  const res = await axiosInstance.delete<MedicineResponse>(
    ENDPOINTS.MEDICINES.DELETE(id)
  );
  return res.data;
};
