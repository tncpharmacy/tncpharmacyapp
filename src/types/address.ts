export interface Address {
  title?: string;
  name: string;
  mobile: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  type?: "Home" | "Work" | "Other";
}

export interface LocationDetails {
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
}
