import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";

export const fetchBuyerByPharmacyIdApi = async (pharmacyId: number) => {
  const res = await api.get(
    ENDPOINTS.BUYER.GET_PHARMACY_PHARMACIST(pharmacyId)
  );
  return res.data;
};

export const fetchBuyerForSuperAdminApi = async () => {
  const res = await api.get(ENDPOINTS.BUYER.GET_SUPER_ADMIN);
  return res.data;
};
