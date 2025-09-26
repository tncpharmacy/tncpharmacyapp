import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { Pharmacy, PharmaciesResponse } from "@/types/pharmacy";

// ✅ Get pharmacy self (by ID)
export const getPharmacy = async (id: number): Promise<Pharmacy> => {
  const response = await api.get<PharmaciesResponse>(
    `${ENDPOINTS.PHARMACY_SELF}${id}/`
  );
  return response.data.data[0];
};

export const updatePharmacy = async (
  id: number,
  data: FormData | Partial<Pharmacy>
): Promise<Pharmacy> => {
  const response = await api.patch<Pharmacy>(
    `${ENDPOINTS.PHARMACY_SELF}${id}/`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data", // 👈 important
      },
    }
  );
  return response.data;
};
