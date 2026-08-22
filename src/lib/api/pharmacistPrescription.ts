// lib/api/prescription.ts
import api from "@/lib/axios";
import { PrescriptionItem } from "@/types/prescription";
import { ENDPOINTS } from "../config";

// ✅ Fetch active prescriptions
export const fetchPrescriptionListPharmacist = async (): Promise<
  PrescriptionItem[]
> => {
  const response = await api.get(
    ENDPOINTS.PRESCRIPTION_UPLOAD.GET_PRESCRIPTION_LIST_PHARMACIST
  );
  return response.data.data; // backend response
};

export interface OCRProduct {
  product_id: number;
  medicine_name: string;
  category_id: number;
  matched_with: string;
  confidence: number;
}

export interface ReceivePrescriptionResponse {
  data: PrescriptionItem;
  product_list: {
    total_medicines_found: number;
    medicines: OCRProduct[];
  };
}

export const receivePrescriptionByPharmacist = async (
  prescriptionId: number,
  pharmacistId: number
): Promise<ReceivePrescriptionResponse> => {
  const response = await api.put(
    ENDPOINTS.PRESCRIPTION_UPLOAD.PRESCRIPTION_RECEIVED_BY_PHARMACIST(
      prescriptionId
    ),
    {
      pharmacist_id: pharmacistId,
    }
  );

  return {
    data: response.data.data,
    product_list: response.data.product_list,
  };
};

// ✅ Upload prescription by pharmacist
export const uploadPrescriptionByPharmacist = async (
  pharmacistId: number,
  payload: FormData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const response = await api.post(
    ENDPOINTS.PRESCRIPTION_UPLOAD.PRESCRIPTION_UPLOAD_BY_PHARMACIST(
      pharmacistId
    ),
    payload
  );
  return response.data;
};

// 🔍 NEW OCR (ocrnew) — extracted medicine shape
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

// 🔍 NEW OCR — download the prescription file and send it to the
// /ocrnew/prescription/extract/ API (multipart form field: "file")
export const extractPrescriptionMedicines = async (
  fileUrl: string
): Promise<OcrExtractResponse> => {
  // 1) Download the prescription (image / pdf) via our own Next.js proxy
  //    route — direct browser fetch from storage.googleapis.com is blocked
  //    by CORS, so the server downloads it and streams it back to us.
  const fileRes = await fetch(
    `/api/prescription-file?url=${encodeURIComponent(fileUrl)}`
  );
  if (!fileRes.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let detail = "";
    try {
      const body = await fileRes.json();
      detail = body?.error ? ` — ${body.error}` : "";
    } catch {
      /* non-JSON body */
    }
    throw new Error(`Failed to download prescription file for OCR${detail}`);
  }
  const blob = await fileRes.blob();

  // Keep original filename — backend detects PDF vs image by extension
  const fileName =
    fileUrl.split("?")[0].split("/").pop() || "prescription.pdf";

  const formData = new FormData();
  formData.append("file", new File([blob], fileName, { type: blob.type }));

  // 2) Send to the new OCR extraction API
  const response = await api.post(
    ENDPOINTS.OCR_NEW.EXTRACT_PRESCRIPTION,
    formData
  );

  return response.data;
};

// 🔥 Update Prescription Status by Pharmacist
export const updatePrescriptionStatusPharmacist = async (
  prescriptionId: number,
  pharmacistId: number
) => {
  const response = await api.put(
    ENDPOINTS.PRESCRIPTION_UPLOAD.PRESCRIPTION_STATUS_UPDATED_PHARMACIST(
      prescriptionId
    ),
    {
      pharmacist_id: pharmacistId,
    }
  );

  return response.data;
};

// Delete Prescription by Pharmacist
export const deletePrescriptionByPharmacist = async (
  prescriptionId: number
) => {
  const response = await api.delete(
    ENDPOINTS.PRESCRIPTION_UPLOAD.PRESCRIPTION_DELETE_BY_PHARMACIST(
      prescriptionId
    )
  );

  return response.data;
};
