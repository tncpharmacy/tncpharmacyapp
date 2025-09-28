export interface Tokens {
  refresh: string;
  access: string;
}

export interface AuthState {
  user: LoginResponse["user"] | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface User {
  id: number;
  user_name: string;
  login_id: string;
  raw_password: string;
  status: string;
  created_on: string;
  updated_on: string;
  is_active: boolean;
  is_staff: boolean;
  user_type: number;
  pharmacy_id_code: string;
  pharmacy_name: string;
  parent_id_pharmacy: number;
  parent_id_pharmacist: number;
  email_id: string;
  gender: string;
  date_of_birth: string;
  aadhar_number: string;
  license_number: string;
  license_valid_upto: string;
  pharmacy_id: number;
  user_id: number;
  role_name: string;
  // optional fields
  last_login?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  groups?: number[];
  user_permissions?: number[];
}

export interface LoginResponse {
  status: string;
  tokens: Tokens;
  user: User;
  accessToken: string;
  refreshToken?: string;
}
