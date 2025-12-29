import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { DoseFormResponse } from "@/types/doseForm";

// =========================
// GET ALL
// =========================
export const fetchDoseForm = async (): Promise<DoseFormResponse> => {
  const res = await axiosInstance.get<DoseFormResponse>(
    ENDPOINTS.DOSES.GET_ALL
  );
  return res.data;
};
