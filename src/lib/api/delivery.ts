// Delivery partner endpoints (tncpharmacyapi delivery/). Every money figure
// here is computed by the server; the screens only display it.
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import type {
  BuyerTracking,
  DeliveryFeeQuote,
  PharmacistDeliveryView,
  RiderQuote,
} from "@/types/delivery";

const data = <T,>(res: { data: { data: T } }) => res.data.data;

// ---- pharmacist / pharmacy staff ----
export const getOrderDeliveryApi = async (orderId: number) =>
  data<PharmacistDeliveryView>(await api.get(ENDPOINTS.DELIVERY.ORDER(orderId)));

export const confirmOrderApi = async (orderId: number) =>
  data<PharmacistDeliveryView>(await api.post(ENDPOINTS.DELIVERY.CONFIRM(orderId)));

export const packOrderApi = async (orderId: number) =>
  data<PharmacistDeliveryView>(await api.post(ENDPOINTS.DELIVERY.PACK(orderId)));

export const getRiderQuoteApi = async (orderId: number) =>
  data<RiderQuote>(await api.get(ENDPOINTS.DELIVERY.QUOTE(orderId)));

export const bookRiderApi = async (orderId: number, body: { thermobox?: boolean; note?: string }) =>
  data<PharmacistDeliveryView>(await api.post(ENDPOINTS.DELIVERY.BOOK_RIDER(orderId), body));

export const cancelRiderApi = async (orderId: number, reason: string) =>
  data<PharmacistDeliveryView>(await api.post(ENDPOINTS.DELIVERY.CANCEL_RIDER(orderId), { reason }));

export const refreshRiderApi = async (orderId: number) =>
  data<PharmacistDeliveryView>(await api.post(ENDPOINTS.DELIVERY.REFRESH(orderId)));

export const simulateRiderApi = async (orderId: number) =>
  data<PharmacistDeliveryView>(await api.post(ENDPOINTS.DELIVERY.SIMULATE(orderId)));

// Hand change when no partner rider is involved (Out for delivery / Delivered / Failed)
export const setStageByHandApi = async (orderId: number, stage: string) =>
  data<PharmacistDeliveryView>(await api.post(ENDPOINTS.DELIVERY.SET_STAGE(orderId), { stage }));

// ---- buyer ----
export const getDeliveryFeeQuoteApi = async (addressId: number) =>
  data<DeliveryFeeQuote>(await api.get(ENDPOINTS.DELIVERY.BUYER_QUOTE(addressId)));

export const getBuyerTrackingApi = async (orderId: number) =>
  data<BuyerTracking>(await api.get(ENDPOINTS.DELIVERY.BUYER_TRACKING(orderId)));
