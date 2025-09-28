// types/subcategory.ts
export interface SubCategory {
  id: number;
  sub_category_name: string;
  description?: string;
  status?: "Active" | "Inactive";
  created_on: string;
  updated_on: string;
  created_by: string | null;
  updated_by: string | null;
  category_name: string;
  category_id: number;
}

export interface SubCategoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SubCategory[];
}

export interface CreateSubCategoryDTO {
  category_id: number;
  sub_category_name: string;
  description?: string;
  status?: "Active" | "Inactive";
}
