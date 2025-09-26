import axios from "axios";
import { ENDPOINTS } from "@/lib/config";
import { Clinic, ClinicResponse } from "@/types/clinic";

export const clinicApi = {
  getClinics: async (): Promise<ClinicResponse> => {
    const { data } = await axios.get<ClinicResponse>(ENDPOINTS.GET_CLINIC);
    return data;
  },

  getClinicById: async (id: number | string): Promise<Clinic> => {
    const { data } = await axios.get<{ data: Clinic }>(
      ENDPOINTS.GET_CLINIC_BY_ID(id)
    );
    return data.data;
  },

  createClinic: async (clinic: Partial<Clinic>): Promise<Clinic> => {
    const { data } = await axios.post<{ data: Clinic }>(
      ENDPOINTS.CREATE_CLINIC,
      clinic
    );
    return data.data;
  },

  updateClinic: async (
    id: number | string,
    clinic: Partial<Clinic>
  ): Promise<Clinic> => {
    const { data } = await axios.patch<{ data: Clinic }>(
      ENDPOINTS.UPDATE_CLINIC(id),
      clinic
    );
    return data.data;
  },

  deleteClinic: async (id: number | string): Promise<void> => {
    await axios.delete(ENDPOINTS.DELETE_CLINIC(id));
  },
};
