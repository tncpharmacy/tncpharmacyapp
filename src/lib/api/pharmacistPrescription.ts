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

// ✅ Mark prescription as received
export const receivePrescriptionByPharmacist = async (
  prescriptionId: number,
  pharmacistId: number
): Promise<PrescriptionItem> => {
  const response = await api.put(
    ENDPOINTS.PRESCRIPTION_UPLOAD.PRESCRIPTION_RECEIVED_BY_PHARMACIST(
      prescriptionId
    ),
    {
      pharmacist_id: pharmacistId,
    }
  );

  return response.data.data; // backend response
};

// ✅ Upload prescription by pharmacist
export const uploadPrescriptionByPharmacist = async (
  pharmacistId: number,
  payload: FormData
): Promise<PrescriptionItem> => {
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
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      },
    }
  );
  return response.data.data;
};
