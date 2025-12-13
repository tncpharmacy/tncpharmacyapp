// contact.interface.ts

export interface ContactItem {
  id: number;
  name: string;
  email: string;
  number: string;
  subject: string;
  contact_summary: string;
}

export interface ContactResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ContactItem[];
}
