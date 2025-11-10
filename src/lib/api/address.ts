import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { Address, AddressResponse } from "@/types/address";

// =========================
// GET ALL Address (BUYER)
// =========================
export const fetchAddress = async (
  buyerId: number
): Promise<AddressResponse> => {
  const res = await axiosInstance.get<AddressResponse>(
    ENDPOINTS.ADDRESS.GET_ALL(buyerId)
  );
  return res.data;
};

// =========================
// GET BY ID (Single Address)
// =========================
export const fetchAddressById = async (
  buyerId: number,
  addressId: number
): Promise<Address> => {
  const res = await axiosInstance.get<Address>(
    ENDPOINTS.ADDRESS.GET_BY_ID(buyerId, addressId)
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
// UPDATE Address (BUYER)
// =========================
export const updateAddress = async (
  id: number,
  data: Partial<Address> | { set_default: boolean }
): Promise<Address> => {
  const res = await axiosInstance.put<Address>(
    ENDPOINTS.ADDRESS.UPDATE(id),
    data
  );
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
