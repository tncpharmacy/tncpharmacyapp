// Single safety advice entity
export interface SafetyAdvice {
  id: number;
  medicine_id: number;

  alcohol: string | null;
  alcohol_label: number | null;

  pregnancy: string | null;
  pregnancy_label: number | null;

  breast_feeding: string | null;
  breast_feeding_label: number | null;

  driving: string | null;
  driving_label: number | null;

  kidney: string | null;
  kidney_label: number | null;

  liver: string | null;
  liver_label: number | null;

  heart: string | null;
  heart_label: number | null;

  status: "Active" | "Inactive";
}

export interface SafetyAdviceByIdResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SafetyAdvice;
}

export interface SafetyLabel {
  id_safetylabel: number;
  safety_label: string;
  status: "Active" | "Inactive";
}

export interface SafetyLabelListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  count: number;
  data: SafetyLabel[];
}
