import axios from "axios";
import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";

const publicAxios = axios.create({ baseURL: "http://68.183.174.17:8081/api" });

export const uploadPrescription = async ({
  formData,
}: {
  formData: FormData;
}) => {
  const res = await publicAxios.post(
    ENDPOINTS.PRESCRIPTION_UPLOAD.PUBLIC_CREATE,
    formData
  );
  return res.data;
};

// ✅ Link prescription to logged-in buyer
export const linkPrescriptionToBuyer = async ({
  sessionId,
  buyerId,
  token,
}: {
  sessionId: string;
  buyerId: number;
  token: string;
}) => {
  const headers = { Authorization: `Bearer ${token}` };
  const response = await axiosInstance.post(
    ENDPOINTS.PRESCRIPTION_UPLOAD.LOGIN_UPDATE,
    { session_id: sessionId, buyer_id: buyerId },
    { headers }
  );
  return response.data;
};
