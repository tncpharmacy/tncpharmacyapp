import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";

export const uploadPrescriptionPublic = async (formData: FormData) => {
  const response = await axiosInstance.post(
    ENDPOINTS.PRESCRIPTION_UPLOAD.PUBLIC_CREATE,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

export const uploadPrescriptionLogin = async (formData: FormData) => {
  const response = await axiosInstance.post(
    ENDPOINTS.PRESCRIPTION_UPLOAD.LOGIN_CREATE,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};
