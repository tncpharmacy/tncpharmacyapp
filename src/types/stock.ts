export interface StockItem {
  id: number; // backend me agar unique id hai
  product_id?: number; // optional agar backend me ho
  MedicineName: string;
  Manufacturer: string;
  PharmacyName: string;
  AvailableQty: string; // backend string me bhej raha hai, agar tu number chah raha hai to parse kar le
  MinStockLevel: string;
  price?: number; // optional agar pehle tha
  quantity?: number; // optional local UI use ke liye
  location: string;
}

export interface StockResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: StockItem[];
}
