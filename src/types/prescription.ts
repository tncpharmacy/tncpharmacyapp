export interface PrescriptionItem {
  session_id: string;
  created_at: string;
  updated_on: string;
  created_by: string | null;
  updated_by: string | null;

  id: number;
  buyer: number; // buyer id
  pharmacist_id: number;
  prescription_id: number;
  buyer_name: string;
  buyer_email: string;
  buyer_number: number;
  prescription_pic: string;
  handle_by: number | null; // pharmacist id handling it, null if not handled
  prescription_status: "0" | "1" | "2"; // 1 = pending, 2 = approved, 0 = rejected (example)
  created_on: string; // ISO date string
}

export interface PrescriptionResponse {
  success: boolean;
  statusCode: number;
  message: string;
  session_id: string;
  count: number;
  data: PrescriptionItem[];
}
