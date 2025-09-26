interface Document {
  id: number;
  document: string;
}

export interface Pharmacy {
  id: number;
  pharmacy_id_code: string;
  pharmacy_name: string;
  license_number: string;
  license_valid_upto: string; // ISO date string
  gst_number: string;
  email_id: string;
  pincode: string;
  district: string;
  address: string;
  status: "Active" | "Inactive"; // sirf do hi state assume kiya
  created_on?: string; // ISO datetime
  updated_on?: string; // ISO datetime
  state: number;
  created_by: number | null;
  updated_by: number | null;
  password: string;
  last_login: string | null;
  is_superuser: boolean;
  user_name: string;
  login_id: string;
  raw_password: string;
  is_active: boolean;
  is_staff: boolean;
  user_type: number;
  parent_id_pharmacy: number | null;
  parent_id_pharmacist: number | null;
  groups: []; // agar groups ki proper type nahi pata, abhi array rakho
  user_permissions: [];
  user_id: number;
  documents: Document[];
}

// root response interface
export interface PharmaciesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Pharmacy[];
}

export interface PharmacySuperAdminForm {
  id: number;
  user_name: string;
  pharmacy_name: string;
  pharmacy_id_code: string;
  login_id?: string;
  license_number: string;
  license_valid_upto: string; // YYYY-MM-DD
  gst_number: string;
  email_id: string;
  pincode: string;
  district: string;
  state: number;
  address: string;
  status: "Active" | "Inactive";
  documents: Document[]; // multiple files
  created_on?: string; // ISO datetime
  updated_on?: string; // ISO datetime
  // 👇 nayi files ke liye alag field rakho
  uploadedFiles?: File[];
}
