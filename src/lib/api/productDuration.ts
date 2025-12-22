import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import {
  ProductDurationResponse,
  ProductDuration,
  CreateProductDurationDTO,
} from "@/types/productDuration";

// =========================
// GET ALL DURATION
// =========================
export const fetchProductDuration =
  async (): Promise<ProductDurationResponse> => {
    const res = await axiosInstance.get<ProductDurationResponse>(
      ENDPOINTS.PRODUCT_DURATION.GET_ALL
    );
    return res.data;
  };

// =========================
// GET DURATION BY ID
// =========================
export const fetchProductDurationById = async (
  productDurationId: number
): Promise<ProductDuration> => {
  const res = await axiosInstance.get<ProductDuration>(
    ENDPOINTS.PRODUCT_DURATION.GET_BY_ID(productDurationId)
  );
  return res.data;
};
// =========================
// CREATE DURATION
// =========================
export const createProductDurationApi = async (
  data: CreateProductDurationDTO
): Promise<ProductDuration> => {
  const res = await axiosInstance.post<ProductDuration>(
    ENDPOINTS.PRODUCT_DURATION.CREATE,
    data
  );
  return res.data;
};
// =========================
// UPDATE DURATION
// =========================
export const updateProductDurationApi = async (
  productDurationId: number,
  data: CreateProductDurationDTO
): Promise<ProductDuration> => {
  const res = await axiosInstance.patch<ProductDurationResponse>(
    ENDPOINTS.PRODUCT_DURATION.PUT_BY_ID(productDurationId),
    data
  );

  if (!res.data.data || res.data.data.length === 0) {
    throw new Error("No category returned from backend");
  }

  return res.data.data[0];
};

// =========================
// DELETE DURATION
// =========================
export const deleteProductDurationApi = async (
  productDurationId: number
): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(
    ENDPOINTS.PRODUCT_DURATION.DELETE(productDurationId)
  );
  return res.data;
};
