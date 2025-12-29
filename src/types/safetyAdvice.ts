// Single safety advice entity
export interface SafetyAdvice {
  id: number;
  medicine_id: number;

  alcohol: string | null;
  alcohol_label: SafetyLabel | null;

  pregnancy: string | null;
  pregnancy_label: SafetyLabel | null;

  breast_feeding: string | null;
  breast_feeding_label: SafetyLabel | null;

  driving: string | null;
  driving_label: SafetyLabel | null;

  kidney: string | null;
  kidney_label: SafetyLabel | null;

  liver: string | null;
  liver_label: SafetyLabel | null;

  heart: string | null;
  heart_label: SafetyLabel | null;

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
