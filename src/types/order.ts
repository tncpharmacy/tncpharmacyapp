export interface OrderProduct {
  product_id: number;
  quantity: string;
  mrp: string;
  discount: string;
  rate: string;
  doses: string;
  instruction: string;
  status: string;
}

export interface OrderPayload {
  payment_mode: number; // 1 = UPI, 2 = COD
  payment_status: string; // "1" for success / "0" for pending
  amount: string; // total amount
  order_type: number; // 2 (as per your API)
  pharmacy_id: number;
  address_id: number;
  status: string;
  products: OrderProduct[];
}

// Unified interface for Buyer Profile
// types/order.ts
// types/order.ts
export interface Product {
  id: number;
  productName?: string;
  quantity: string;
  mrp: string;
  discount: string;
  rate: string;
  doses?: string;
  instruction?: string;
  status: string;
  manufacturer?: string;
}

export interface OrderDetails {
  orderId: number;
  buyerName: string;
  orderDate: string;
  paymentStatus: string;
  amount: string;
  orderType: string;
  paymentMode: string;
  address: string;
  products: Product[];
}

export interface BuyerAddress {
  id: number;
  name: string;
  address: string;
  location: string;
  pincode: string;
  mobile: string;
  status: "Active" | "Inactive";
  address_type_id: number;
}

export interface BuyerData {
  id: number;
  name: string;
  number: string;
  email: string;
}

export interface BuyerOrderItem {
  buyer: BuyerData;
  addresses: BuyerAddress[];
  orders: OrderDetails[];
}
