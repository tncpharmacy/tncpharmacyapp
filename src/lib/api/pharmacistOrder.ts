import api from "../axios";
import { ENDPOINTS } from "../config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createOrderApi = async (
  buyerId: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>
) => {
  return api.post(ENDPOINTS.PHARMACIST_ORDER.POST_ORDER(buyerId), payload);
};

export const getOrderByIdApi = (orderId: number) => {
  return api.get(ENDPOINTS.PHARMACIST_ORDER.GET_ORDER_BY_ORDERID(orderId));
};

export const getOrderListApi = () => {
  return api.get(ENDPOINTS.PHARMACIST_ORDER.GET_ORDER_LIST);
};
