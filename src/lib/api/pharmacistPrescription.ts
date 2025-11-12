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
