export interface ProductDuration {
  id: number;
  name: string;
  status?: "Active" | "Inactive";
  created_on: string;
  updated_on: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ProductDurationResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ProductDuration[];
}

export interface CreateProductDurationDTO {
  name: string;
  status?: "Active" | "Inactive";
}
