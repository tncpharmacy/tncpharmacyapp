// 🔹 Tokens returned from backend
export interface BuyerTokens {
  refresh: string;
  access: string;
}

// 🔹 Buyer detail returned from backend
export interface BuyerData {
  id: number;
  name: string;
  number: string;
  email: string;
  otp?: string;
  tokens?: BuyerTokens;
  existing?: boolean;
}

// 🔹 Common API response wrapper
export interface BuyerApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: BuyerData;
}

// 🔹 Redux state shape
export interface BuyerState {
  loading: boolean;
  error: string | null;
  otpSent: boolean;
  token: string | null;
  userExists: boolean | null;
  registered: boolean;
  message: string | null;
  buyer: BuyerData | null;
  otpCode: string | null;
  lastLoginResponse: BuyerApiResponse | null;
  orders: [];
  orderCreated: boolean;
}
