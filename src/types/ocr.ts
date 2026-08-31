// Shared types for the new OCR API (/ocrnew/prescription/extract/)

export interface OcrExtractedMedicine {
  medicine_id: number;
  medicine_name: string;
  generic_id: number;
  master_mrp: string;
  confidence: number;
  review_score: number;
  needs_review: boolean;
  extracted_name: string;
  mrp: string;
}

export interface OcrExtractResponse {
  success: boolean;
  message: string;
  total_medicines_found: number;
  medicines: OcrExtractedMedicine[];
}
