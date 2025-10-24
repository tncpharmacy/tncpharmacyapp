import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { Address, AddressResponse } from "@/types/address";

// =========================
// GET ALL Address (BUYER)
// =========================
export const fetchAddress = async (id: number): Promise<AddressResponse> => {
  const res = await axiosInstance.get<AddressResponse>(
    ENDPOINTS.ADDRESS.GET_ALL(id)
  );
  return res.data;
};
// =========================
// CREATE Address (BUYER)
// =========================
export const createAddress = async (data: Address): Promise<Address> => {
  const res = await axiosInstance.post<Address>(ENDPOINTS.ADDRESS.CREATE, data);
  return res.data;
};
// =========================
// DELETE Address (BUYER)
// =========================
export const deleteAddress = async (
  id: number
): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(
    ENDPOINTS.ADDRESS.DELETE(id)
  );
  return res.data;
};
