// =========================
// SUBCATEGORY DTOs (ADMIN)
// =========================
export interface CreateSubCategoryDTO {
  sub_category_name: string;
  description?: string;
  status?: "Active" | "Inactive";
  category_id: number;
}

export interface UpdateSubCategoryDTO {
  sub_category_name?: string;
  description?: string;
  status?: "Active" | "Inactive";
  category_id?: number;
}

import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { SubCategory, SubCategoryResponse } from "@/types/subCategory";

// GET ALL
export const fetchSubcategories = async (): Promise<SubCategoryResponse> => {
  const res = await axiosInstance.get<SubCategoryResponse>(
    ENDPOINTS.SUBCATEGORY.GET_ALL
  );
  return res.data;
};

// GET BY ID
export const fetchSubcategoryById = async (
  id: number
): Promise<SubCategoryResponse> => {
  const res = await axiosInstance.get<SubCategoryResponse>(
    ENDPOINTS.SUBCATEGORY.GET_BY_ID(id)
  );
  return res.data;
};

// CREATE
export const createSubcategoryApi = async (
  data: CreateSubCategoryDTO
): Promise<SubCategory> => {
  const res = await axiosInstance.post<SubCategory>(
    ENDPOINTS.SUBCATEGORY.CREATE,
    data
  );
  return res.data;
};

// UPDATE
export const updateSubcategoryApi = async (
  id: number,
  data: UpdateSubCategoryDTO
): Promise<SubCategory> => {
  const res = await axiosInstance.put<SubCategory>(
    ENDPOINTS.SUBCATEGORY.UPDATE(id),
    data
  );
  return res.data;
};

// DELETE
export const deleteSubcategoryApi = async (id: number): Promise<void> => {
  await axiosInstance.delete(ENDPOINTS.SUBCATEGORY.DELETE(id));
};
