import axios from "axios";
import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
const mediaBase = process.env.NEXT_PUBLIC_API_BASE_URL;

const publicAxios = axios.create({
  baseURL: mediaBase,
});

export const uploadPrescriptionFromBuyerCart = async ({
  formData,
  token,
}: {
  formData: FormData;
  token: string;
}) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  };

  const res = await axiosInstance.post(
    ENDPOINTS.PRESCRIPTION_UPLOAD.CREATE_PRESCRIPTION_FROM_BUYER_CART,
    formData,
    { headers }
  );

  return res.data;
};

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
