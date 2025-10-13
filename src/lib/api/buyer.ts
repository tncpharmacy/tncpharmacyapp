import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";

export const buyerLoginApi = async (payload: { login_id: string }) => {
  return axiosInstance.post(ENDPOINTS.BUYER.LOGIN, payload);
};

export const buyerRegisterApi = async (payload: {
  name: string;
  email: string;
  number: string;
}) => {
  return axiosInstance.post(ENDPOINTS.BUYER.CREATE, payload);
};

export const buyerDeleteApi = async (id: number) => {
  return axiosInstance.delete(ENDPOINTS.BUYER.DELETE(id));
};
