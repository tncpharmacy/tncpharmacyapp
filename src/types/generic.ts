// types/category.ts
export interface Generic {
  id_generic: number;
  generic_name: string;
  description?: string;
  status?: "Active" | "Inactive";
  created_on: string;
  updated_on: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface GenericResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Generic[];
}

export interface CreateGenericDTO {
  generic_name: string;
  description?: string;
  status?: "Active" | "Inactive";
}
