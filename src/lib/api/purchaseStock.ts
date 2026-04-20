import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import axios from "axios";
import { PurchasePayload, PurchaseResponse } from "@/types/purchase";
import { StockResponse } from "@/types/stock";

export const createPurchase = async (
  payload: PurchasePayload
): Promise<PurchaseResponse> => {
  try {
    const response = await api.post<PurchaseResponse>(
      ENDPOINTS.PURCHASE_STOCK.CREATE,
      payload
    );
    return response.data;
  } catch (error: unknown) {
    // console.log("🔥 FULL ERROR:", error);

    if (axios.isAxiosError(error)) {
      // console.log("🔥 AXIOS ERROR DATA:", error.response?.data);
      // console.log("🔥 AXIOS ERROR STATUS:", error.response?.status);
      // console.log("🔥 AXIOS ERROR HEADERS:", error.response?.headers);

      const responseData = error.response?.data as PurchaseResponse | undefined;

      throw (
        responseData ?? {
          message: "Unknown API error",
          success: false,
          statusCode: 500,
        }
      );
    }

    throw {
      message: "Unexpected error occurred",
      success: false,
      statusCode: 500,
    };
  }
};

export const fetchPharmacyStock = async (
  pharmacyId: number
): Promise<StockResponse> => {
  const res = await api.get(
    ENDPOINTS.PURCHASE_STOCK.GET_STOCK_LIST_PHARMACY(pharmacyId)
  );
  return res.data;
};

export const getPharmacistByIdApi = (id: number) => {
  return api.get(ENDPOINTS.PURCHASE_STOCK.GET_PHARMACIST_BY_ID(id));
};

export const getPharmacistListApi = () => {
  return api.get(ENDPOINTS.PURCHASE_STOCK.GET_PHARMACIST_LIST);
};

export const getStockListSuperAdminApi = () => {
  return api.get(ENDPOINTS.PURCHASE_STOCK.GET_STOCK_LIST_FOR_SUPERADMIN);
};
