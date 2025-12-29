import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { MedicineSafety } from "@/types/medicine";
import {
  SafetyAdviceByIdResponse,
  SafetyLabelListResponse,
} from "@/types/safetyAdvice";

/**
 * GET SAFETY LABELS (MASTER)
 * NOTE: this is NOT SafetyAdvice entity
 */

export const fetchSafetyAdvice = async (): Promise<SafetyLabelListResponse> => {
  const res = await axiosInstance.get<SafetyLabelListResponse>(
    ENDPOINTS.SAFETY_LABEL.GET_ALL
  );
  return res.data;
};

/**
 * GET SAFETY ADVICE BY MEDICINE ID
 */
export const fetchSafetyAdviceById = async (
  medicineId: number
): Promise<SafetyAdviceByIdResponse> => {
  const res = await axiosInstance.get<SafetyAdviceByIdResponse>(
    ENDPOINTS.SAFETY_LABEL.GET_BY_ID(medicineId)
  );
  return res.data;
};

/**
 * CREATE / UPDATE SAFETY ADVICE
 * Payload = MedicineSafety
 */
export const saveSafetyAdviceApi = async (
  data: MedicineSafety
): Promise<SafetyAdviceByIdResponse> => {
  const res = await axiosInstance.post<SafetyAdviceByIdResponse>(
    ENDPOINTS.SAFETY_LABEL.CREATE,
    data
  );
  return res.data;
};
