// api/state.ts
import api from "@/lib/axios"; // jo interceptor wala instance hai
import { ENDPOINTS } from "@/lib/config";

export const getStates = async () => {
  const response = await api.get(ENDPOINTS.GET_STATES);
  return response.data; // slice me yahi return hoga
};
