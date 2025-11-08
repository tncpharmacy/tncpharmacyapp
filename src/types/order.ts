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
