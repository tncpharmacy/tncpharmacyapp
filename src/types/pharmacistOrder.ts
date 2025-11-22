export interface PharmacistOrderState {
  loading: boolean;
  error: string | null;
  order: OrderItem | null;
  orders: OrderItem[];
  buyerOrderList: OrderItem[];
  orderCreated: boolean;
}

// types/orders.ts

export type RoleType = "Buyer" | "Seller" | string;
export type PaymentStatus = "Buy" | "Pending" | "Refund" | string;
export type OrderType = "Offline" | "Online" | string;
export type PaymentMode = "UPI" | "Cash" | "Card" | string;

export interface ProductItem {
  id: number;
  product_id: number | null;
  medicine_name: string | null;
  manufacturer: string | null;
  image: string | null;
  quantity: string; // kept string because API returns "5", "2"
  mrp: string; // string in payload
  discount: string; // percent as string
  rate: string; // string in payload
  doses: string | null; // e.g. "1-0-1" or null
  instruction: string | null;
  status: string; // status flag as string ("1")
}

export interface OrderItem {
  orderId: number;
  buyerName: string | null;
  orderDate: string; // ISO-ish string "YYYY-MM-DD hh:mm:ss"
  paymentStatus: PaymentStatus;
  amount: string; // string in payload, convert to number if needed
  orderType: OrderType;
  paymentMode: PaymentMode;
  address: string | null;
  pincode: string | null;
  location: string | null;
  map: string | null;
  products: ProductItem[]; // may be empty array
}

export interface OrdersResponse {
  success: boolean;
  statusCode: number;
  message: string;
  role_type: RoleType;
  data: OrderItem[];
}
