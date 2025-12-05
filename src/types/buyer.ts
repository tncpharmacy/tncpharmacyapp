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
  profile_pic?: string;
  status?: string;
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
  details: OrderDetail | null;
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

  orderId: number;
  buyerName: string;
  buyerNumber?: string;
  buyerEmail?: string;
  buyer_uhid?: string;
  orderDate: string;
  paymentStatus: string;
  amount: string;
  orderType: string;
  paymentMode: string;
  additional_discount?: string;

  address?: string; // <-- ADD THIS

  products: Array<{
    id: number;
    medicine_name: string;
    manufacturer: string;
    image: string | null;
    quantity: string;
    mrp: string;
    discount: string;
    rate: string;
    doses: string;
    duration: string;
    remark: string | null;
    status: string;
  }>;
}

export interface OrderDetail {
  orderId: number;
  buyerName: string;
  buyerEmail?: string;
  buyerNumber?: string;
  buyer_uhid?: string;
  orderDate: string;
  paymentStatus: string;
  amount: string;
  orderType: string;
  paymentMode: string;
  additional_discount?: string;
  address?: string;

  products: Array<{
    id: number;
    medicine_name: string;
    manufacturer: string;
    image: string | null;
    quantity: string;
    mrp: string;
    discount: string;
    rate: string;
    doses: string;
    duration: string;
    remark: string | null;
    status: string;
  }>;
}
