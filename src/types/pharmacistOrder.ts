// ===============================
// Global State
// ===============================
export interface PharmacistOrderState {
  loading: boolean;
  error: string | null;
  order: PharmacistOrder | null; // FIXED: OrderItem was wrong
  orders: PharmacistOrder[]; // FIXED: should match response
  buyerOrderList: OrderItem[]; // Buyer list uses buyer OrderItem
  orderCreated: boolean;
  // pharmacistOrder: PharmacistOrder[];
}

// ===============================
// Common Types
// ===============================
export type RoleType = "Buyer" | "Seller" | string;
export type PaymentStatus = "Buy" | "Pending" | "Refund" | string;
export type OrderType = "Offline" | "Online" | string;
export type PaymentMode = "UPI" | "Cash" | "Card" | string;

// ===============================
// Product Item (Buyer side)
// ===============================
export interface ProductItem {
  id: number;
  product_id: number | null;
  medicine_name: string | null;
  manufacturer: string | null;
  image: string | null;

  quantity: string;
  mrp: string;
  discount: string;
  rate: string;

  doses: string | null;
  instruction: string | null;
  status: string;
}

// ===============================
// ORDER ITEM (BUYER SIDE NORMAL ORDERS)
// ===============================
export interface OrderItem {
  orderId: number;
  buyerName: string | null;
  orderDate: string;
  paymentStatus: PaymentStatus;

  amount: string;
  orderType: OrderType;
  paymentMode: PaymentMode;

  address: string | null;
  pincode: string | null;
  location: string | null;
  map: string | null;

  products: ProductItem[];
}

// ===============================
// BUYER ORDER LIST RESPONSE
// ===============================
export interface OrdersResponse {
  success: boolean;
  statusCode: number;
  message: string;
  role_type: RoleType;
  data: OrderItem[];
}

// ===============================
// ORDER (PHARMACIST SIDE)
// ===============================
export interface PharmacistOrder {
  orderId: number;
  buyerName: string;
  buyerEmail: string;
  buyerNumber: string;
  address: string;
  orderDate: string;
  paymentStatus: string;

  amount: string;
  orderType: string;
  paymentMode: string;

  pharmacy_id_code: string;
  pharmacy_name: string;
  license_number: string;
  license_valid_upto: string;
  gst_number: string;
  email_id: string;

  pincode: string;
  district: string;
  state_name: string;
  pharmacy_address: string;

  products: OrderProduct[];
}

// ===============================
// PHARMACIST SIDE PRODUCT
// ===============================
export interface OrderProduct {
  id: number;
  product_id: number | null; // FIXED (must match ProductItem)
  medicine_name: string | null;
  manufacturer: string | null;
  image: string | null;

  quantity: string;
  mrp: string;
  discount: string;
  rate: string;

  doses: string;
  remark: string;
  status: string;
}

// ===============================
// PHARMACIST ORDER LIST API
// ===============================
export interface OrderListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  role_id: number;
  data: PharmacistOrder[];
}

// ===============================
// PHARMACIST SIMPLE ORDER (Matches your API exactly)
// ===============================

// Product structure returned by API
export interface SimpleOrderProduct {
  id: number;
  product_id: number | null;
  medicine_name: string | null;
  manufacturer: string | null;
  image: string | null;

  quantity: string;
  mrp: string;
  discount: string;
  rate: string;

  doses: string | null;
  remark: string | null;
  status: string;
}

// Order item structure returned by API (pharmacist buyer-specific)
export interface SimplePharmacistOrder {
  orderId: number;
  buyerName: string;
  orderDate: string;
  paymentStatus: string;

  amount: string;
  orderType: string;
  paymentMode: string;

  address: string | null;
  pincode: string | null;
  location: string | null;
  map: string | null;

  products: SimpleOrderProduct[];
}

// API Response
export interface SimplePharmacistOrderResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SimplePharmacistOrder[];
}
