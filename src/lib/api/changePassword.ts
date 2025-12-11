// src/lib/api/changePassword.ts
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { PasswordResponse, PasswordPayload } from "@/types/changePassword";

export const updatePassword = async (
  userId: number,
  userTypeId: number,
  data: PasswordPayload["data"]
): Promise<PasswordResponse> => {
  const res = await api.put<PasswordResponse>(
    ENDPOINTS.CHANGE_PASSWORD.PUT_PASSWORD(userId, userTypeId),
    data
  );
  return res.data;
};
