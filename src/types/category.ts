// types/category.ts
export interface Category {
  id: number;
  category_name: string;
  description?: string;
  status?: "Active" | "Inactive";
  created_on: string;
  updated_on: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CategoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Category[];
}

export interface CreateCategoryDTO {
  category_name: string;
  description?: string;
  status?: "Active" | "Inactive";
}
