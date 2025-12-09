export interface Supplier {
  id: number;
  supplier_id_code: string;
  supplier_name: string;
  user_name: string;
  license_number: string;
  license_valid_upto: string; // ISO date string
  gst_number: string;
  email_id: string;
  supplier_mobile: string; // <-- added
  login_id: string;
  // contact_person: string; // <-- added
  pincode: string;
  district: string;
  address: string;
  state: number;
  status: "Active" | "Inactive"; // good practice
  pharmacy_id: number;
  pharmacist_id: number; // <-- added
  documents: Document[]; // <-- added
  uploadedFiles?: File[];
  created_on: string;
  updated_on: string;
  created_by: number;
  updated_by: number;
}

interface Document {
  id: number;
  document: string;
}

export interface SupplierListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Supplier[];
}
