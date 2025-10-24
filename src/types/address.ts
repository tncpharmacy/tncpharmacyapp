export interface AddressResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Address[];
}

export interface Address {
  id: number;
  name: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  country: string;
  type: string;
  pincode: string;
  location: string;
  map: string;
  default_address: number;
  status: string;
  buyer: number;
  address_type_id: number;
}
