import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";

export const fetchBuyerByPharmacyIdApi = async (pharmacyId: number) => {
  const res = await api.get(
    ENDPOINTS.BUYER.GET_PHARMACY_PHARMACIST(pharmacyId)
  );
  return res.data;
};

export const fetchPharmacistBuyerByIdApi = async (buyerId: number) => {
  const res = await api.get(
    ENDPOINTS.BUYER.PHARMACIST_GET_BY_BUYER_ID(buyerId)
  );
  return res.data;
};

export const fetchBuyerForSuperAdminApi = async () => {
  const res = await api.get(ENDPOINTS.BUYER.GET_SUPER_ADMIN);
  return res.data;
};

export const updateBuyerForPharmacistApi = async (
  buyerId: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
) => {
  const res = await api.put(
    ENDPOINTS.BUYER.PUT_BUYER_FOR_PHARMACIST(buyerId),
    payload
  );
  return res.data;
};
