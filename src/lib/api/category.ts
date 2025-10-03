// api/category.ts
import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { Category, CategoryResponse } from "@/types/category";

// =========================
// GET ALL CATEGORIES
// =========================
export const fetchCategories = async (): Promise<CategoryResponse> => {
  const res = await axiosInstance.get<CategoryResponse>(
    ENDPOINTS.CATEGORY.GET_ALL
  );
  return res.data;
};

// =========================
// GET ALL CATEGORIES List
// =========================
export const fetchCategoriesAllList = async (): Promise<CategoryResponse> => {
  const res = await axiosInstance.get<CategoryResponse>(
    ENDPOINTS.CATEGORY.GET_ALL_LIST
  );
  return res.data;
};

// =========================
// GET CATEGORY BY ID
// =========================
export const fetchCategoryById = async (id: number): Promise<Category> => {
  const res = await axiosInstance.get<Category>(
    ENDPOINTS.CATEGORY.GET_BY_ID(id)
  );
  return res.data;
};

// =========================
// CREATE CATEGORY (ADMIN)
// =========================
export interface CreateCategoryDTO {
  category_name: string;
  description?: string;
  status?: "Active" | "Inactive";
}

export const createCategoryApi = async (
  data: CreateCategoryDTO
): Promise<Category> => {
  const res = await axiosInstance.post<Category>(
    ENDPOINTS.CATEGORY.CREATE,
    data
  );
  return res.data;
};

// =========================
// UPDATE CATEGORY (ADMIN)
// =========================
export interface UpdateCategoryDTO {
  category_name?: string;
  description?: string;
  status?: "Active" | "Inactive";
}

// Update API ab CategoryResponse return karega
export const updateCategoryApi = async (
  id: number,
  data: UpdateCategoryDTO
): Promise<Category> => {
  const res = await axiosInstance.patch<CategoryResponse>(
    ENDPOINTS.CATEGORY.UPDATE(id),
    data
  );

  if (!res.data.data || res.data.data.length === 0) {
    throw new Error("No category returned from backend");
  }

  return res.data.data[0];
};

// =========================
// DELETE CATEGORY (ADMIN)
// =========================
export const deleteCategoryApi = async (
  id: number
): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(
    ENDPOINTS.CATEGORY.DELETE(id)
  );
  return res.data;
};
