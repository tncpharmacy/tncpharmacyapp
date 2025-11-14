export interface PharmacistOrderState {
  loading: boolean;
  error: string | null;
  order: any | null;
  orders: any[];
  orderCreated: boolean;
}
