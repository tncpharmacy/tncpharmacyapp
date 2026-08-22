import axios from "axios";
import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { OcrExtractResponse } from "@/types/ocr";
const mediaBase = process.env.NEXT_PUBLIC_API_BASE_URL;

const publicAxios = axios.create({
  baseURL: mediaBase,
});

// 🔍 Read the prescription with the new OCR API and get matched medicines.
// The endpoint is public (AllowAny, no auth), so guests can use it too.
// We send the File the buyer just picked directly — no storage round-trip.
export const extractMedicinesFromPrescriptionFile = async (
  file: File
): Promise<OcrExtractResponse> => {
  const formData = new FormData();
  // Filename is preserved: the backend detects PDF vs image by extension.
  formData.append("file", file, file.name);

  const res = await publicAxios.post<OcrExtractResponse>(
    ENDPOINTS.OCR_NEW.EXTRACT_PRESCRIPTION,
    formData,
    {
      // OCR + Gemini matching can take a while on large prescriptions
      timeout: 180000,
    }
  );

  return res.data;
};

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
