// types/category.ts
export interface Manufacturer {
  id_manufacturer: number;
  manufacturer_name: string;
  status?: "Active" | "Inactive";
  created_on: string;
  updated_on: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ManufacturerResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Manufacturer[];
}

export interface CreateManufacturerDTO {
  manufacturer_name: string;
  status?: "Active" | "Inactive";
}
