import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { Unit, UnitResponse } from "@/types/unit";

// =========================
// GET ALL Units
// =========================
export const fetchUnitAll = async (): Promise<UnitResponse> => {
  const res = await axiosInstance.get<UnitResponse>(ENDPOINTS.UNIT.GET_ALL);
  return res.data;
};

// =========================
// GET ALL LIST Units
// =========================
export const fetchUnitAllList = async (): Promise<UnitResponse> => {
  const res = await axiosInstance.get<UnitResponse>(
    ENDPOINTS.UNIT.GET_ALL_LIST
  );
  return res.data;
};

// =========================
// GET Unit BY ID
// =========================
export const fetchUnitById = async (id: number): Promise<Unit> => {
  const res = await axiosInstance.get<Unit>(ENDPOINTS.UNIT.GET_BY_ID(id));
  return res.data;
};

// =========================
// CREATE Unit (ADMIN)
// =========================
// export interface CreateUnitDTO {
//   Unit_name: string;
//   description?: string;
//   status?: "Active" | "Inactive";
// }

// export const createUnitApi = async (
//   data: CreateUnitDTO
// ): Promise<Unit> => {
//   const res = await axiosInstance.post<Unit>(ENDPOINTS.UNIT.CREATE, data);
//   return res.data;
// };

// =========================
// UPDATE Unit (ADMIN)
// =========================
// export interface UpdateUnitDTO {
//   Unit_name?: string;
//   description?: string;
//   status?: "Active" | "Inactive";
// }

// // Update API ab UnitResponse return karega
// export const updateUnitApi = async (
//   id: number,
//   data: UpdateUnitDTO
// ): Promise<Unit> => {
//   const res = await axiosInstance.patch<UnitResponse>(
//     ENDPOINTS.UNIT.UPDATE(id),
//     data
//   );

//   if (!res.data.data || res.data.data.length === 0) {
//     throw new Error("No Unit returned from backend");
//   }

//   return res.data.data[0];
// };

// =========================
// DELETE Unit (ADMIN)
// =========================
// export const deleteUnitApi = async (
//   id: number
// ): Promise<{ message: string }> => {
//   const res = await axiosInstance.delete<{ message: string }>(
//     ENDPOINTS.UNIT.DELETE(id)
//   );
//   return res.data;
// };
