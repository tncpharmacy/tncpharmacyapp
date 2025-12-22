import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import {
  ProductInstructionResponse,
  ProductInstruction,
  CreateProductInstructionDTO,
} from "@/types/productInstruction";

// =========================
// GET ALL INSTRUCTION
// =========================
export const fetchProductInstruction =
  async (): Promise<ProductInstructionResponse> => {
    const res = await axiosInstance.get<ProductInstructionResponse>(
      ENDPOINTS.PRODUCT_INSTRUCTION.GET_ALL
    );
    return res.data;
  };

// =========================
// GET INSTRUCTION BY ID
// =========================
export const fetchProductInstructionById = async (
  productInstructionId: number
): Promise<ProductInstruction> => {
  const res = await axiosInstance.get<ProductInstruction>(
    ENDPOINTS.PRODUCT_INSTRUCTION.GET_BY_ID(productInstructionId)
  );
  return res.data;
};
// =========================
// CREATE INSTRUCTION
// =========================
export const createProductInstructionApi = async (
  data: CreateProductInstructionDTO
): Promise<ProductInstruction> => {
  const res = await axiosInstance.post<ProductInstruction>(
    ENDPOINTS.PRODUCT_INSTRUCTION.CREATE,
    data
  );
  return res.data;
};
// =========================
// UPDATE INSTRUCTION
// =========================
export const updateProductInstructionApi = async (
  productInstructionId: number,
  data: CreateProductInstructionDTO
): Promise<ProductInstruction> => {
  const res = await axiosInstance.patch<ProductInstructionResponse>(
    ENDPOINTS.PRODUCT_INSTRUCTION.PUT_BY_ID(productInstructionId),
    data
  );

  if (!res.data.data || res.data.data.length === 0) {
    throw new Error("No category returned from backend");
  }

  return res.data.data[0];
};

// =========================
// DELETE INSTRUCTION
// =========================
export const deleteProductInstructionApi = async (
  productInstructionId: number
): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(
    ENDPOINTS.PRODUCT_INSTRUCTION.DELETE(productInstructionId)
  );
  return res.data;
};
