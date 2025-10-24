export interface AddressResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Address[];
}

export interface Address {
  id: number;
  title?: string;
  name: string;
  mobile: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  type?: "Home" | "Work" | "Other";
  location: string;
  map: string;
  default_address: number;
  status: string;
  buyer: number;
  address_type_id: number;
}

export interface LocationDetails {
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
}
