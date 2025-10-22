import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import axios from "axios";
import { PurchasePayload, PurchaseResponse } from "@/types/purchase";

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
    console.error("Error creating purchase:", error);

    // ✅ Check if error is AxiosError
    if (axios.isAxiosError(error)) {
      // TypeScript now knows error.response exists
      const responseData = error.response?.data as PurchaseResponse | undefined;
      throw (
        responseData ?? {
          message: "Unknown API error",
          success: false,
          statusCode: 500,
        }
      );
    }

    // ✅ Fallback for unexpected errors
    throw {
      message: "Unexpected error occurred",
      success: false,
      statusCode: 500,
    };
  }
};
