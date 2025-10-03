import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { Generic, GenericResponse } from "@/types/generic";

// =========================
// GET ALL Generics
// =========================
export const fetchGenericAll = async (): Promise<GenericResponse> => {
  const res = await axiosInstance.get<GenericResponse>(
    ENDPOINTS.GENERIC.GET_ALL
  );
  return res.data;
};

// =========================
// GET ALL LIST Generics
// =========================
export const fetchGenericAllList = async (): Promise<GenericResponse> => {
  const res = await axiosInstance.get<GenericResponse>(
    ENDPOINTS.GENERIC.GET_ALL_LIST
  );
  return res.data;
};

// =========================
// GET Generic BY ID
// =========================
export const fetchGenericById = async (id: number): Promise<Generic> => {
  const res = await axiosInstance.get<Generic>(ENDPOINTS.GENERIC.GET_BY_ID(id));
  return res.data;
};

// =========================
// CREATE Generic (ADMIN)
// =========================
// export interface CreateGenericDTO {
//   Generic_name: string;
//   description?: string;
//   status?: "Active" | "Inactive";
// }

// export const createGenericApi = async (
//   data: CreateGenericDTO
// ): Promise<Generic> => {
//   const res = await axiosInstance.post<Generic>(ENDPOINTS.GENERIC.CREATE, data);
//   return res.data;
// };

// =========================
// UPDATE Generic (ADMIN)
// =========================
// export interface UpdateGenericDTO {
//   Generic_name?: string;
//   description?: string;
//   status?: "Active" | "Inactive";
// }

// // Update API ab GenericResponse return karega
// export const updateGenericApi = async (
//   id: number,
//   data: UpdateGenericDTO
// ): Promise<Generic> => {
//   const res = await axiosInstance.patch<GenericResponse>(
//     ENDPOINTS.GENERIC.UPDATE(id),
//     data
//   );

//   if (!res.data.data || res.data.data.length === 0) {
//     throw new Error("No Generic returned from backend");
//   }

//   return res.data.data[0];
// };

// =========================
// DELETE Generic (ADMIN)
// =========================
// export const deleteGenericApi = async (
//   id: number
// ): Promise<{ message: string }> => {
//   const res = await axiosInstance.delete<{ message: string }>(
//     ENDPOINTS.GENERIC.DELETE(id)
//   );
//   return res.data;
// };
