// api/buyer.ts
import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";

// 🔹 LOGIN (Send OTP)
export const buyerLoginApi = async (payload: { login_id: string }) => {
  return axiosInstance.post(ENDPOINTS.BUYER.LOGIN, payload);
};

// 🔹 REGISTER (Send OTP)
export const buyerRegisterApi = async (payload: {
  name: string;
  email: string;
  number: string;
}) => {
  return axiosInstance.post(ENDPOINTS.BUYER.CREATE, payload);
};

// 🔹 GET Buyer Profile
export const buyerGetApi = async (id: number) => {
  return axiosInstance.get(ENDPOINTS.BUYER.GET(id));
};

// 🔹 UPDATE Buyer Profile
export const buyerUpdateApi = async (
  id: number,
  payload: { name?: string; email?: string; number?: string }
) => {
  return axiosInstance.put(ENDPOINTS.BUYER.PUT(id), payload);
};

// 🔹 DELETE Buyer
export const buyerDeleteApi = async (id: number) => {
  return axiosInstance.delete(ENDPOINTS.BUYER.DELETE(id));
};
