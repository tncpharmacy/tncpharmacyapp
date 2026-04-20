import api from "../axios";
import { ENDPOINTS } from "../config";

// create order by pharmacist
export const createOrderApi = async (
  buyerId: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>
) => {
  return api.post(ENDPOINTS.PHARMACIST_ORDER.POST_ORDER(buyerId), payload);
};

// get order by buyer id
export const getOrderByBuyerIdApi = (buyerId: number) => {
  return api.get(ENDPOINTS.PHARMACIST_ORDER.GET_ORDER_BY_BUYER_ID(buyerId));
};

// get order  by id
export const getOrderByIdApi = (orderId: number) => {
  return api.get(ENDPOINTS.PHARMACIST_ORDER.GET_ORDER_BY_ORDERID(orderId));
};

// get order list
export const getOrderListApi = () => {
  return api.get(ENDPOINTS.PHARMACIST_ORDER.GET_ORDER_LIST);
};

// get report order wise
export const getReportOrderWiseApi = ({
  startDate,
  endDate,
  orderType,
  paymentMode,
}: {
  startDate: string;
  endDate: string;
  orderType?: number;
  paymentMode?: number;
}) => {
  return api.get(
    ENDPOINTS.PHARMACIST_ORDER.GET_REPORT_ORDER_WISE({
      startDate,
      endDate,
      orderType,
      paymentMode,
    })
  );
};

// get report product wise
export const getReportProductWiseApi = () => {
  return api.get(ENDPOINTS.PHARMACIST_ORDER.GET_REPORT);
};
