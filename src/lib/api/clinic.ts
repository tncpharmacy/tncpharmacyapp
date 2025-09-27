import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { Clinic } from "@/types/clinic";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T; // this is the actual payload
}

export const clinicApi = {
  getClinics: async (): Promise<Clinic[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Clinic[]>>(
      ENDPOINTS.GET_CLINIC
    );

    return data.data; // ✅ array return karega
  },

  getClinicById: async (id: number | string): Promise<Clinic> => {
    const { data } = await axiosInstance.get<{ data: Clinic }>(
      ENDPOINTS.GET_CLINIC_BY_ID(id)
    );
    return data.data;
  },

  createClinic: async (clinic: Partial<Clinic>): Promise<Clinic> => {
    const { data } = await axiosInstance.post<{ data: Clinic }>(
      ENDPOINTS.CREATE_CLINIC,
      clinic
    );
    return data.data;
  },

  updateClinic: async (
    id: number | string,
    clinic: Partial<Clinic>
  ): Promise<Clinic> => {
    const { data } = await axiosInstance.patch<{ data: Clinic }>(
      ENDPOINTS.UPDATE_CLINIC(id),
      clinic
    );
    return data.data;
  },

  deleteClinic: async (id: number | string): Promise<void> => {
    await axiosInstance.delete(ENDPOINTS.DELETE_CLINIC(id));
  },
};
