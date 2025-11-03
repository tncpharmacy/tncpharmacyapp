export interface DocumentFile {
  id: number;
  document: string;
  default_image: number;
}

export interface MedicineImage {
  id?: number;
  document: string;
  default_image?: number;
}
export interface MedicineFormData {
  id: number;
  medicine_name: string;
  pack_size: string;
  variant: string;
  product_introduction: string;
  prescription_required: number;
  generic: string;
  unit: string;
  manufacturer: string;
  category: string | number;
  sub_category: string | number;
  description: string;
  dose_form: string;
  uses_benefits: string;
  side_effect: string;
  direction_for_use: string;
  storage: string;
  status: "Active" | "Inactive";
  documents: DocumentFile[]; // existing uploaded docs
  uploadedFiles: File[]; // new files from InputFile
}

export interface Medicine {
  id: number;
  unit: string;
  medicine_name: string;
  manufacturer_name?: string;
  Manufacturer?: string;
  AvailableQTY?: number | null;
  AvailableQty?: number | null;
  MRP?: number | null;
  generic_name?: string;
  GenericName?: string;
  dose_form?: string;
  pack_size?: string;
  prescription_required?: number;
  discount?: string;
  status?: string;
  category_id?: number;
  created_by?: number;
  product_introduction: string;
  mrp?: number | null;
  description?: string;
  direction_for_use?: string;
  safety_advice?: SafetyAdvice;
  side_effect?: string;
  storage?: string;
  uses_benefits?: string;
  created_on: string;
  updated_on: string;
  varient_id: number | null;
  dose_form_id: number;
  updated_by: number | null;
  primary_image: {
    id: number;
    document: string;
    default_image: number;
  };
  documents: DocumentFile[];
  images?: MedicineImage[];

  product_id: number;
  ProductName: string;
  varient: string;
  Doses_form: string;
  Discount: string;
  DefaultImageURL: string;
}

export interface MedicineResponse {
  success: boolean;
  statusCode: number;
  message: string;
  count: number;
  data: Medicine[];
}
export interface MedicineMenuResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Medicine[];
}

export interface Product {
  id: number;
  pharmacy: string;
  purchase_date: string;
  invoice_number: string;
  supplier: string;
  medicine_name: string;
  pack_size: string;
  manufacturer_name: string;
  qty: string;
  batch: string;
  expiry_date: string;
  discount: string;
  mrp: string;
  purchase_rate: string;
  amount: string;
}

export type SafetyLabel = {
  id_safetylabel: number;
  safety_label: string;
};

export type SafetyAdvice = {
  alcohol?: string;
  alcohol_label?: SafetyLabel | null;
  pregnancy?: string;
  pregnancy_label?: SafetyLabel | null;
  breast_feeding?: string;
  breast_feeding_label?: SafetyLabel | null;
  driving?: string;
  driving_label?: SafetyLabel | null;
  kidney?: string;
  kidney_label?: SafetyLabel | null;
  liver?: string;
  liver_label?: SafetyLabel | null;
};

// --- Safety Keys Definitions ---

// 1. Safety fields without the '_label' suffix (e.g., 'alcohol')
export type SafetyFieldKeys =
  | "alcohol"
  | "pregnancy"
  | "breast_feeding"
  | "driving"
  | "kidney"
  | "liver";

// 2. Safety fields with the '_label' suffix (e.g., 'alcohol_label')
export type SafetyLabelKeys =
  | "alcohol_label"
  | "pregnancy_label"
  | "breast_feeding_label"
  | "driving_label"
  | "kidney_label"
  | "liver_label";

export interface CareGroup {
  id: number;
  group_name: string;
  image_url: string | null;
  status: "Active" | string;
}

/**
 * 2. Interface for the complete API response structure.
 */
export interface CareGroupResponse {
  success: boolean;
  statusCode: 200;
  message: string;
  data: CareGroup[];
}
