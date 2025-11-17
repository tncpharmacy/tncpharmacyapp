// types/purchase.ts

export interface PurchaseDetail {
  pharmacy_id: string | number;
  product_id: number;
  quantity: string;
  //available_quantity: string;
  batch: string;
  expiry_date: string;
  mrp: string;
  discount: string;
  purchase_rate: string;
  amount: string;
}

export interface PurchasePayload {
  pharmacy_id: number;
  supplier_id: number;
  invoice_num: string;
  purchase_date: string;
  status: string;
  purchase_details: PurchaseDetail[];
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data?: PurchasePayload[]; // or you can define exact response structure if known
}
