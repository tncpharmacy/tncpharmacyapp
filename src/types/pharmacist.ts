interface Document {
  id: number;
  document: string;
}

export interface Pharmacist {
  id: number;
  pharmacy_id: number;
  user_name: string;
  pharmacy_name: string;
  license_number: string;
  license_valid_upto: string;
  gender: string;
  email_id: string;
  date_of_birth: string;
  status: "Active" | "Inactive";
  aadhar_number: string;
  login_id: string;
  uploadedFiles: File[];
  documents: { id: number; document: string; created_on: string }[];
  profile_pic?: File | null;
  profile_image?: File | null;

  // optional fields
  created_by?: string | null;
  created_on?: string;
  updated_by?: string | null;
  updated_on?: string;
  user_id?: number;
}

// root response interface
export interface PharmaciesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Pharmacist[];
}
