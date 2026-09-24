// TNC-19: Razorpay endpoints. The amount is never sent from here — the
// server charges the order's own, server-computed amount.
import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";

export interface PaymentConfig {
  razorpay_enabled: boolean;
  razorpay_key_id: string | null;
  hold_minutes: number;
}

export interface RazorpayOrderData {
  key_id: string;
  razorpay_order_id: string;
  amount: number; // paise
  currency: string;
  order_id: number;
  order_number: string | null;
  name: string;
  prefill: { name: string; contact: string; email: string };
}

export const getPaymentConfigApi = async (): Promise<PaymentConfig> => {
  const res = await axiosInstance.get(ENDPOINTS.PAYMENT.CONFIG);
  return res.data.data;
};

export const createRazorpayOrderApi = async (
  orderId: number
): Promise<RazorpayOrderData> => {
  const res = await axiosInstance.post(ENDPOINTS.PAYMENT.RAZORPAY_ORDER, {
    order_id: orderId,
  });
  return res.data.data;
};

export const verifyRazorpayPaymentApi = async (body: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const res = await axiosInstance.post(ENDPOINTS.PAYMENT.RAZORPAY_VERIFY, body);
  return res.data;
};

export const abandonRazorpayPaymentApi = async (orderId: number) => {
  const res = await axiosInstance.post(ENDPOINTS.PAYMENT.RAZORPAY_ABANDON, {
    order_id: orderId,
  });
  return res.data;
};
