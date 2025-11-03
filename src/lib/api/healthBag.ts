import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { HealthBag, HealthBagResponse } from "@/types/healthBag";

// =========================
// GET ALL HEALTHBAG (BUYER)
// =========================
export const fetchHealthBag = async (
  id: number
): Promise<HealthBagResponse> => {
  const res = await axiosInstance.get<HealthBagResponse>(
    ENDPOINTS.HEALTHBAG.GET_ALL(id)
  );
  return res.data;
};
// =========================
// CREATE HEALTHBAG (BUYER)
// =========================
export interface createHealthBagDTO {
  buyer_id: number;
  product_id: number;
  quantity: number;
}
export const createHealthBag = async (
  data: createHealthBagDTO
): Promise<HealthBag> => {
  const res = await axiosInstance.post<HealthBag>(
    ENDPOINTS.HEALTHBAG.CREATE,
    data
  );
  return res.data;
};
// =========================
// DELETE HEALTHBAG (BUYER)
// =========================
export const deleteHealthBag = async (
  id: number
): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(
    ENDPOINTS.HEALTHBAG.DELETE(id)
  );
  return res.data;
};

// ===============================
// GET ALL HEALTHBAG List (ADMIN)
// ===============================
export const fetchHealthBagAdmin = async (): Promise<HealthBag> => {
  const res = await axiosInstance.get<HealthBag>(ENDPOINTS.HEALTHBAG.GET_ADMIN);
  return res.data;
};
