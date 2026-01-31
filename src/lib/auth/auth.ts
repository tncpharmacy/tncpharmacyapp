import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { LoginResponse } from "@/types/login";
import { jwtDecode } from "jwt-decode";

// ===== helpers =====
const isBrowser = () => typeof window !== "undefined";

// ===== types =====
export interface DecodedToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: string;
  id: number;
  pharmacy_name?: string;
  pharmacy_email_id?: string;
  pharmacy_login_id?: string;
  pharmacy_address?: string;
  pharmacy_district?: string;
  pharmacy_pincode?: string;
  pharmacy_id?: string;
  last_login: string;
  is_superuser: boolean;
  user_name: string;
  login_id: string;
  raw_password?: string;
  status: string;
  created_on: string;
  updated_on: string;
  user_type: number;
  parent_id_pharmacy?: number | null;
  parent_id_pharmacist?: number | null;
  parent_id_clinic?: number | null;
  created_by?: number | null;
  updated_by?: number | null;
  role_name: string;
}

// ===== auth =====
export const login = async (
  login_id: string,
  password: string
): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>(ENDPOINTS.LOGIN, {
    login_id,
    password,
  });

  const { access, refresh } = res.data.tokens;

  if (isBrowser()) {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    const decoded: DecodedToken = jwtDecode(access);
    localStorage.setItem("user", JSON.stringify(decoded));
  }

  return res.data;
};

// ===== SAFE GETTERS =====
export const getUser = (): DecodedToken | null => {
  if (!isBrowser()) return null;

  try {
    const user = localStorage.getItem("user");
    return user ? (JSON.parse(user) as DecodedToken) : null;
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem("accessToken");
};

export const getRefreshToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem("refreshToken");
};

export const getUserId = (): number | null => {
  const user = getUser();
  return user?.id ?? null;
};
