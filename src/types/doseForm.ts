export interface DoseForm {
  id: number;
  doses_form: string;
  description?: string;
  status?: "Active" | "Inactive";
  created_on: string;
  updated_on: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface DoseFormResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: DoseForm[];
}
