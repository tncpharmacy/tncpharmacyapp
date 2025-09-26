// src/lib/api/pharmacy.ts
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { Pharmacy, PharmaciesResponse } from "@/types/pharmacy";

// fetch pharmacy list data
export const fetchPharmacyListApi = async () => {
  const response = await api.get(ENDPOINTS.GET_PHARMACY_LIST);
  return response.data.data; // sirf array return karo
};

// ✅ Get all pharmacies (always fresh, no cache issue)
export const fetchPharmaciesApi = async (): Promise<Pharmacy[]> => {
  const res = await api.get<PharmaciesResponse>(
    `${ENDPOINTS.GET_PHARMACIES}?_t=${Date.now()}`
  );
  return res.data.data;
};

// ✅ Get pharmacy by ID
export const fetchPharmacyByIdApi = async (
  id: number | string
): Promise<Pharmacy> => {
  const res = await api.get<{ success: boolean; data: Pharmacy[] }>(
    ENDPOINTS.GET_PHARMACY_BY_ID(id)
  );

  console.log("🔹 Fetching pharmacy by ID:", ENDPOINTS.GET_PHARMACY_BY_ID(id));
  return res.data.data[0]; // 👈 ek hi object return kar
};

// ✅ Create pharmacy
export const createPharmacyApi = async (
  data: Partial<Pharmacy> | FormData
): Promise<Pharmacy> => {
  const res = await api.post<Pharmacy>(ENDPOINTS.CREATE_PHARMACY, data, {
    headers:
      data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return res.data;
};

// ✅ Update pharmacy (PATCH)
export const updatePharmacyApi = async (
  id: number | string,
  data: Partial<Pharmacy> | FormData
): Promise<Pharmacy> => {
  const res = await api.patch<Pharmacy>(ENDPOINTS.UPDATE_PHARMACY(id), data, {
    headers:
      data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return res.data;
};

// toggle status (activate/deactivate pharmacy)
export const togglePharmacyStatusApi = async (
  id: number
): Promise<Pharmacy> => {
  const res = await api.delete<{ data: Pharmacy }>(
    ENDPOINTS.DELETE_PHARMACY(id)
  );
  return res.data.data; // 👈 backend updated pharmacy object return karta hai
};
