import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { LoginResponse } from "@/types/login";
import { jwtDecode } from "jwt-decode"; // named import

// Token ke andar se jo bhi user data chahiye, uska interface
export interface DecodedToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: string;
  id: number;
  pharmacy_name?: string;
  last_login: string;
  is_superuser: boolean;
  user_name: string;
  login_id: string;
  raw_password?: string; // optional, agar token me ho
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

export const login = async (
  login_id: string,
  password: string
): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>(ENDPOINTS.LOGIN, {
    login_id,
    password,
  });

  const { access, refresh } = res.data.tokens;

  // ✅ Token save
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);

  // ✅ Decode access token aur user save
  const decoded: DecodedToken = jwtDecode(access);
  localStorage.setItem("user", JSON.stringify(decoded));

  return res.data;
};

// Optional helpers
export const getUser = (): DecodedToken | null => {
  const user = localStorage.getItem("user");
  return user ? (JSON.parse(user) as DecodedToken) : null;
};

export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");
export const getUserId = (): number | null => {
  const user = getUser();
  return user?.id ?? null;
};
