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
    payload,
    {
      headers: {
        "Content-Type": undefined,
      },
      transformResponse: [
        (data, headers) => {
          if (!data && headers && headers["content-length"] === "0") {
            return { data: { id: 0 } };
          }
          return JSON.parse(data);
        },
      ],
      validateStatus: (status) => status >= 200 && status < 300,
    }
  );

  // ⛔ Wrong earlier: return response.data.data;
  // ✅ Correct:
  return response.data;
};
