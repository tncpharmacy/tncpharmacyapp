// types/category.ts
export interface Unit {
  id_unit: number;
  unit: string;
  status?: "Active" | "Inactive";
  created_on: string;
  updated_on: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface UnitResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Unit[];
}

export interface CreateUnitDTO {
  unit: string;
  status?: "Active" | "Inactive";
}
