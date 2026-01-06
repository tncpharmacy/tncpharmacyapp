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
  HSN_Code?: string;

  prescription_required: number;
  H1_Restricted: number;

  generic_id: number | null;
  unit_id: number | null;
  manufacturer_id: number | null;
  dose_form_id: number | null;

  category?: number | null;
  sub_category?: number | null;

  discount?: number;
  GST?: number;
  variant?: string;

  product_introduction: string;
  description: string;
  direction_for_use: string;
  side_effect: string;
  storage: string;
  uses_benefits: string;

  status: "Active" | "Inactive";
}

export interface Medicine {
  id: number;
  medicine_id: number;
  unit: string;
  medicine_name: string;
  H1_Restricted: number;
  prescription_required: number;
  manufacturer_name?: string;
  Manufacturer?: string;
  AvailableQTY?: number | null;
  AvailableQty?: number | null;
  MRP?: number | null;
  generic_name?: string;
  GenericName?: string;
  dose_form?: string;
  pack_size?: string;
  Disc?: string | number;
  discount?: string;
  status?: string;
  category_id: number;
  created_by?: number;
  product_introduction: string;
  mrp?: number | null;
  description?: string;
  direction_for_use?: string;
  safety_advice?: MedicineSafety;
  side_effect?: string;
  storage?: string;
  uses_benefits?: string;
  created_on: string;
  updated_on: string;
  varient_id: number | null;
  updated_by: number | null;
  generic_id: number | null;
  unit_id: number | null;
  manufacturer_id: number | null;
  dose_form_id: number | null;

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
  default_image: string;
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
  location: string;
  applied_discount: string;
}

export type SafetyLabel = {
  id_safetylabel: number;
  safety_label: string;
};

export type MedicineSafety = {
  alcohol?: string | null;
  alcohol_label?: SafetyLabel | null;

  pregnancy?: string | null;
  pregnancy_label?: SafetyLabel | null;

  breast_feeding?: string | null;
  breast_feeding_label?: SafetyLabel | null;

  driving?: string | null;
  driving_label?: SafetyLabel | null;

  kidney?: string | null;
  kidney_label?: SafetyLabel | null;

  liver?: string | null;
  liver_label?: SafetyLabel | null;

  heart?: string | null;
  heart_label?: SafetyLabel | null;
};

// --- Safety Keys Definitions ---

// 1. Safety fields without the '_label' suffix (e.g., 'alcohol')
export type SafetyFieldKeys =
  | "alcohol"
  | "pregnancy"
  | "breast_feeding"
  | "driving"
  | "kidney"
  | "liver"
  | "heart";

export type SafetyLabelKeys =
  | "alcohol_label"
  | "pregnancy_label"
  | "breast_feeding_label"
  | "driving_label"
  | "kidney_label"
  | "liver_label"
  | "heart_label";

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
