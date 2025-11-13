import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { HealthBag, HealthBagResponse } from "@/types/healthBag";

// =========================
// GET ALL HEALTHBAG (BUYER)
// =========================
export const fetchHealthBag = async (
  id: number
): Promise<HealthBagResponse> => {
  const res = await api.get<HealthBagResponse>(
    ENDPOINTS.HEALTHBAG_PHARMACIST.GET_ALL(id)
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
  doses: string;
  flag: number;
  instruction: string;
}

export const createHealthBag = async (
  data: createHealthBagDTO
): Promise<HealthBag> => {
  const res = await api.post<HealthBag>(
    ENDPOINTS.HEALTHBAG_PHARMACIST.CREATE,
    data
  );
  return res.data;
};

export const deleteHealthBag = async (
  id: number
): Promise<{ message: string }> => {
  try {
    const res = await api.delete(ENDPOINTS.HEALTHBAG_PHARMACIST.DELETE(id));
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
  const res = await api.put(
    ENDPOINTS.HEALTHBAG_PHARMACIST.QUANTITY_INCREASE(cart_id),
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
  const res = await api.put(
    ENDPOINTS.HEALTHBAG_PHARMACIST.QUANTITY_DECREASE(cart_id),
    {
      buyer_id,
      product_id,
      quantity,
    }
  );
  return res.data;
};
