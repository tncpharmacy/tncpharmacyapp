import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { CareGroupResponse, MedicineResponse } from "@/types/medicine";
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
// =========================
// GET GROUP CARE
// =========================
export const fetchGroupCare = async (): Promise<CareGroupResponse> => {
  const res = await axiosInstance.get<CareGroupResponse>(
    ENDPOINTS.MEDICINES.GET_GROUP_CARE
  );
  return res.data; // ✅ res.data is now MedicineResponse
};
