export interface Clinic {
  id: number;
  clinicName: string;
  address: string;
  status: string;
  created_on: string;
  updated_on: string;
  created_by: string;
  updated_by: string | null;
  last_login: string | null;
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

export interface ClinicResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Clinic[];
}
