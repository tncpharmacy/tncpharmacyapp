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

export const deleteHealthBag = async (
  id: number
): Promise<{ message: string }> => {
  try {
    const res = await axiosInstance.delete(ENDPOINTS.HEALTHBAG.DELETE(id));
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(
      "❌ deleteHealthBag error:",
      err.response?.data || err.message
    );
    throw err;
  }
};
// ===============================
// INCREASE QUANTITY
// ===============================
export const increaseQuantity = async (
  cart_id: number,
  buyer_id: number,
  product_id: number,
  quantity: number
) => {
  const res = await axiosInstance.put(
    ENDPOINTS.HEALTHBAG.QUANTITY_INCREASE(cart_id),
    {
      buyer_id,
      product_id,
      quantity,
    }
  );
  return res.data;
};

// ===============================
// DECREASE QUANTITY
// ===============================
export const decreaseQuantity = async (
  cart_id: number,
  buyer_id: number,
  product_id: number,
  quantity: number
) => {
  const res = await axiosInstance.put(
    ENDPOINTS.HEALTHBAG.QUANTITY_DECREASE(cart_id),
    {
      buyer_id,
      product_id,
      quantity,
    }
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
