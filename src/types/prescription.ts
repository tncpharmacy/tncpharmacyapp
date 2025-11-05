export interface PrescriptionItem {
  id: number;
  session_id: string;
  prescription_pic: string;
  created_on: string;
  updated_on: string;
  buyer: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface PrescriptionResponse {
  success: boolean;
  statusCode: number;
  message: string;
  session_id: string;
  count: number;
  data: PrescriptionItem;
}
