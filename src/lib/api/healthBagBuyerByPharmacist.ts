// api.ts
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";

// ================================
// GET ALL BUYER LIST
// ================================
export const fetchBuyerList = async () => {
  const res = await api.get(ENDPOINTS.HEALTHBAG_PHARMACIST.GET_BUYER_LIST);
  return res.data;
};

// ================================
// GET BUYER BY ID
// ================================
export const fetchBuyerById = async (buyerId: number) => {
  const res = await api.get(
    ENDPOINTS.HEALTHBAG_PHARMACIST.GET_BUYER_LIST_BY_ID(buyerId)
  );
  return res.data;
};

// ================================
// UPDATE BUYER (PUT)
// ================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateBuyerById = async (id: number, payload: any) => {
  const res = await api.put(
    ENDPOINTS.HEALTHBAG_PHARMACIST.PUT_BY_ID(id),
    payload
  );
  return res.data;
};

// ================================
// DELETE BUYER
// ================================
export const deleteBuyerById = async (id: number) => {
  const token = localStorage.getItem("token");

  const res = await api.delete(
    ENDPOINTS.HEALTHBAG_PHARMACIST.DELETE_BY_ID(id),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// ================================
// INCREASE QUANTITY
// ================================
export const increaseBuyerQuantity = async (cartId: number) => {
  const res = await api.put(
    ENDPOINTS.HEALTHBAG_PHARMACIST.BUYER_QUANTITY_INCREASE(cartId)
  );
  return res.data;
};

// ================================
// DECREASE QUANTITY
// ================================
export const decreaseBuyerQuantity = async (cartId: number) => {
  const res = await api.put(
    ENDPOINTS.HEALTHBAG_PHARMACIST.BUYER_QUANTITY_DECREASE(cartId)
  );
  return res.data;
};
