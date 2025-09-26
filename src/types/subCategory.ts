// types/subcategory.ts
export interface SubCategory {
  id: number;
  sub_category_name: string;
  description: string | null;
  status: string;
  created_on: string;
  updated_on: string;
  category_id: number;
  created_by: string | null;
  updated_by: string | null;
  category_name: string;
}

export interface SubCategoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SubCategory[];
}
