// 🔹 Tokens returned from backend
export interface BuyerTokens {
  refresh: string;
  access: string;
}

// 🔹 Buyer detail returned from backend
export interface BuyerData {
  id: number;
  name: string;
  uhid: string;
  number: string;
  buyer_id?: number;
  email: string;
  otp?: string;
  tokens?: BuyerTokens;
  existing?: boolean;
  // buyer?: [];
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

  list: BuyerOrderItem[];
  details: BuyerOrderDetail | null;
}

export interface BuyerOrderItem {
  id: number;
  order_no: string;
  date: string;
  total_amount: number;
  status: string;
}

export interface BuyerOrderDetail {
  id: number;
  order_no: string;
  items: Array<{
    product_id: number;
    name: string;
    qty: number;
    price: number;
  }>;
  total_amount: number;
  date: string;
}
