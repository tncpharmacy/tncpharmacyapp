// src/lib/api/pharmacy.ts
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { Pharmacist, PharmaciesResponse } from "@/types/pharmacist";

// ✅ Get all pharmacies (always fresh, no cache issue)
export const fetchPharmacistApi = async (): Promise<Pharmacist[]> => {
  const res = await api.get<PharmaciesResponse>(
    `${ENDPOINTS.PHARMACY_GET_PHARMACISTS}`
  );
  return res.data.data;
};

// ✅ Get Pharmacist by ID
export const fetchPharmacistByIdApi = async (
  id: number | string
): Promise<Pharmacist> => {
  const res = await api.get<{ success: boolean; data: Pharmacist[] }>(
    ENDPOINTS.PHARMACY_GET_PHARMACIST_BY_ID(id)
  );

  console.log(
    "🔹 Fetching pharmacy by ID:",
    ENDPOINTS.PHARMACY_GET_PHARMACIST_BY_ID(id)
  );
  return res.data.data[0]; // 👈 ek hi object return kar
};

// ✅ Create pharmacy
export const createPharmacistApi = async (
  data: Partial<Pharmacist> | FormData
): Promise<Pharmacist> => {
  const res = await api.post<Pharmacist>(
    ENDPOINTS.PHARMACY_CREATE_PHARMACIST,
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

// ✅ Update pharmacy (PATCH)
export const updatePharmacistApi = async (
  id: number | string,
  data: Partial<Pharmacist> | FormData
): Promise<Pharmacist> => {
  const res = await api.patch<Pharmacist>(
    ENDPOINTS.PHARMACY_UPDATE_PHARMACIST(id),
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

// toggle status (activate/deactivate pharmacy)
export const togglePharmacistStatusApi = async (
  id: number
): Promise<Pharmacist> => {
  const res = await api.delete<{ data: Pharmacist }>(
    ENDPOINTS.PHARMACY_DELETE_PHARMACIST(id)
  );
  return res.data.data; // 👈 backend updated pharmacy object return karta hai
};
