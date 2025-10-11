import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { MedicineResponse } from "@/types/medicine"; // 👈 ye type humne pehle define kiya tha

// =========================
// GET ALL MEDICINES List
// =========================
export const fetchMedicinesAllList = async (): Promise<MedicineResponse> => {
  const res = await axiosInstance.get<MedicineResponse>(
    ENDPOINTS.MEDICINES.GET_ALL_LIST
  );
  return res.data; // ✅ res.data is now MedicineResponse
};
