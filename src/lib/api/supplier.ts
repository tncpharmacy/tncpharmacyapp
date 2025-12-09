// src/lib/api/supplier.ts
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { Supplier } from "@/types/supplier";

// fetch pharmacy list data
export const fetchSupplierApi = async () => {
  const response = await api.get(ENDPOINTS.SUPPLIER.GET_SUPPLIER);
  return response.data.data; // sirf array return karo
};

// ✅ Get Supplier by ID
export const fetchSupplierByIdApi = async (
  id: number | string
): Promise<Supplier> => {
  const res = await api.get<{ success: boolean; data: Supplier[] }>(
    ENDPOINTS.SUPPLIER.GET_SUPPLIER_BY_ID(id)
  );
  return res.data.data[0]; // 👈 ek hi object return kar
};

// ✅ Create Supplier
export const createSupplierApi = async (
  data: Partial<Supplier> | FormData
): Promise<Supplier> => {
  const res = await api.post<Supplier>(
    ENDPOINTS.SUPPLIER.CREATE_SUPPLIER,
    data,
    {
      headers:
        data instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : {},
    }
  );
  return res.data;
};

// ✅ Update Supplier (PATCH)
export const updateSupplierApi = async (
  id: number | string,
  data: Partial<Supplier> | FormData
): Promise<Supplier> => {
  const res = await api.patch<Supplier>(
    ENDPOINTS.SUPPLIER.UPDATE_SUPPLIER(id),
    data,
    {
      headers:
        data instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : {},
    }
  );
  return res.data;
};

// toggle status (activate/deactivate Supplier)
export const toggleSupplierStatusApi = async (
  id: number
): Promise<Supplier> => {
  const res = await api.delete<{ data: Supplier }>(
    ENDPOINTS.SUPPLIER.DELETE_SUPPLIER(id)
  );
  return res.data.data; // 👈 backend updated Supplier object return karta hai
};
