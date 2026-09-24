export interface StockItem {
  id: number; // backend me agar unique id hai
  medicine_id?: number; // optional agar backend me ho
  MedicineName: string;
  Manufacturer: string;
  PharmacyName: string;
  /** Stock on hand: sum of non-expired batches (TNC-17). A number since TNC-16. */
  AvailableQty: number | string;
  MinStockLevel: number | string;
  /** Units sitting in expired batches — not sellable, should be pulled. */
  ExpiredQty?: number;
  /** Everything ever received for this product (the old "stock" figure). */
  TotalReceived?: number;
  /** Server-computed: on hand is at or below the reorder level. */
  IsLowStock?: boolean;
  price?: number; // optional agar pehle tha
  quantity?: number; // optional local UI use ke liye
  location: string;

  purchase_date?: string;
  invoice_num?: string;
  pharmacy_name?: string;
  supplier_name?: string;
  pharmacy_id?: string;
  items: PurchaseItem[];
}
export interface PurchaseItem {
  id: number;
  medicine_name: string;
  pack_size: string;
  batch: string;
  expiry_date: string;
  quantity: string;
  available_quantity: string;
  mrp: string;
  discount: string;
  purchase_rate: string;
  amount: string;
}

export interface StockResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: StockItem[];
}
