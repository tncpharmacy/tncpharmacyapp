export interface DocumentFile {
  id?: number;
  document: string;
}

export interface MedicineFormData {
  id: number;
  item_name: string;
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
  dose: string;
  uses: string;
  side_effect: string;
  direction_for_use: string;
  storage: string;
  status: "Active" | "Inactive";
  documents: DocumentFile[]; // existing uploaded docs
  uploadedFiles: File[]; // new files from InputFile
}

export interface Medicine {
  id: number;
  generic_name: string;
  manufacturer_name: string;
  unit: string;
  medicine_name: string;
  pack_size: string;
  prescription_required: number;
  product_introduction: string;
  description: string;
  uses_benefits: string;
  side_effect: string;
  direction_for_use: string;
  storage: string;
  status: string;
  created_on: string;
  updated_on: string;
  varient_id: number | null;
  dose_form_id: number;
  created_by: number;
  updated_by: number | null;
  primary_image: string | null;
}

export interface MedicineResponse {
  success: boolean;
  statusCode: number;
  message: string;
  count: number;
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
