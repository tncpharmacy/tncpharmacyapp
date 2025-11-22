export interface StockItem {
  id: number; // backend me agar unique id hai
  medicine_id?: number; // optional agar backend me ho
  MedicineName: string;
  Manufacturer: string;
  PharmacyName: string;
  AvailableQty: string; // backend string me bhej raha hai, agar tu number chah raha hai to parse kar le
  MinStockLevel: string;
  price?: number; // optional agar pehle tha
  quantity?: number; // optional local UI use ke liye
  location: string;

  purchase_date?: string;
  invoice_num?: string;
  pharmacy_name?: string;
  supplier_name?: string;
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
