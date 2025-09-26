import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { Pharmacist, PharmaciesResponse } from "@/types/pharmacist";

// ✅ Get pharmacy self (by ID)
export const getPharmacist = async (id: number): Promise<Pharmacist> => {
  const response = await api.get<PharmaciesResponse>(
    `${ENDPOINTS.PHARMACIST_SELF}${id}/`
  );
  return response.data.data[0];
};

export const updatePharmacist = async (
  id: number,
  data: FormData | Partial<Pharmacist>
): Promise<Pharmacist> => {
  const response = await api.patch<Pharmacist>(
    `${ENDPOINTS.PHARMACIST_SELF}${id}/`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data", // 👈 important
      },
    }
  );
  return response.data;
};
