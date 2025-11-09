export interface HealthBag {
  id: number;
  buyer_id: number;
  product_id: number;
  productid: number;
  productname: string;
  quantity: number;
  qty: number;
  created_at?: string;
  updated_at?: string;
}

export interface HealthBagResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: HealthBag[];
}
