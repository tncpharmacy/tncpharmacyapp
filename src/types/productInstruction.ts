export interface ProductInstruction {
  id: number;
  name: string;
  status?: "Active" | "Inactive";
  created_on: string;
  updated_on: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ProductInstructionResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ProductInstruction[];
}

export interface CreateProductInstructionDTO {
  name: string;
  status?: "Active" | "Inactive";
}
