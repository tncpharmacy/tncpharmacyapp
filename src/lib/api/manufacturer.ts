import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { Manufacturer, ManufacturerResponse } from "@/types/manufacturer";

// =========================
// GET ALL Manufacturers
// =========================
export const fetchManufacturerAll = async (): Promise<ManufacturerResponse> => {
  const res = await axiosInstance.get<ManufacturerResponse>(
    ENDPOINTS.MANUFACTURER.GET_ALL
  );
  return res.data;
};

// =========================
// GET ALL LIST Manufacturers
// =========================
export const fetchManufacturerAllList =
  async (): Promise<ManufacturerResponse> => {
    const res = await axiosInstance.get<ManufacturerResponse>(
      ENDPOINTS.MANUFACTURER.GET_ALL_LIST
    );
    return res.data;
  };

// =========================
// GET Manufacturer BY ID
// =========================
export const fetchManufacturerById = async (
  id: number
): Promise<Manufacturer> => {
  const res = await axiosInstance.get<Manufacturer>(
    ENDPOINTS.MANUFACTURER.GET_BY_ID(id)
  );
  return res.data;
};

// =========================
// CREATE Manufacturer (ADMIN)
// =========================
// export interface CreateManufacturerDTO {
//   Manufacturer_name: string;
//   description?: string;
//   status?: "Active" | "Inactive";
// }

// export const createManufacturerApi = async (
//   data: CreateManufacturerDTO
// ): Promise<Manufacturer> => {
//   const res = await axiosInstance.post<Manufacturer>(ENDPOINTS.MANUFACTURER.CREATE, data);
//   return res.data;
// };

// =========================
// UPDATE Manufacturer (ADMIN)
// =========================
// export interface UpdateManufacturerDTO {
//   Manufacturer_name?: string;
//   description?: string;
//   status?: "Active" | "Inactive";
// }

// // Update API ab ManufacturerResponse return karega
// export const updateManufacturerApi = async (
//   id: number,
//   data: UpdateManufacturerDTO
// ): Promise<Manufacturer> => {
//   const res = await axiosInstance.patch<ManufacturerResponse>(
//     ENDPOINTS.MANUFACTURER.UPDATE(id),
//     data
//   );

//   if (!res.data.data || res.data.data.length === 0) {
//     throw new Error("No Manufacturer returned from backend");
//   }

//   return res.data.data[0];
// };

// =========================
// DELETE Manufacturer (ADMIN)
// =========================
// export const deleteManufacturerApi = async (
//   id: number
// ): Promise<{ message: string }> => {
//   const res = await axiosInstance.delete<{ message: string }>(
//     ENDPOINTS.MANUFACTURER.DELETE(id)
//   );
//   return res.data;
// };
