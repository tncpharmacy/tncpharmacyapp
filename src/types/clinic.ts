export interface Clinic {
  id: number;
  clinicName: string;
  numberDoctor: number | null;
  address: string | null;
  email_id: string | null;
  pincode: string | null;
  gst_number: string | null;
  license_number: string | null;
  license_valid_upto: string | null; // ISO string from DB
  status: "Active" | "Inactive"; // Enum style
  created_on: string; // ISO string
  updated_on: string; // ISO string
  clinic_type: string | null;
  state: string | null;
  created_by: string | null;
  updated_by: string | null;
  last_login: string | null; // ISO string
  is_superuser: boolean;
  user_name: string;
  login_id: string;
  user_type: number;
  parent_id_pharmacy: number | null;
  parent_id_pharmacist: number | null;
  parent_id_clinic: number | null;
  parent_id_doctor: number | null;
  user_id: number;
}

interface Document {
  id: number;
  name: string;
  url: string;
}

export interface ClinicAdd {
  id: number;
  clinic_id_code: string;
  user_name: string;
  clinicName?: string;
  clinic_type: string;
  license_number: string;
  license_valid_upto: string; // agar Date use karna hai to Date bhi rakh sakte ho
  gst_number: string;
  email_id: string;
  pincode: string;
  district: string;
  state: number; // state ka id hoga ya enum use karoge
  address: string;
  number_of_doctors: string; // count numeric ho sakta hai (number)
  number_of_staff: string; // count numeric ho sakta hai (number)
  department_specialties: string; // multiple departments ko comma separated ya string[] rakhna accha hoga
  status: "Active" | "Inactive"; // status ko union type banaya
  login_id: string;
  uploadedFiles: File[]; // file URLs / file names
  documents: Document[]; // documents URLs / ids
}

export interface ClinicResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Clinic[];
}
