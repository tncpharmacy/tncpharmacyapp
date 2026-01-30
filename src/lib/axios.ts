import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { safeLocalStorage } from "@/lib/utils/safeLocalStorage"; // << add this

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
});

// 🔹 Unauthorized callback
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

// 🔹 Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ⛔ No window check → safeLocalStorage handles SSR
    const buyerToken = safeLocalStorage.getItem("buyerAccessToken");
    const adminToken = safeLocalStorage.getItem("accessToken");
    const token = buyerToken || adminToken;

    const publicEndpoints = [
      "/masterapp/category/",
      "/masterapp/subcategory/",
      "/masterapp/category/list/",
      "/masterapp/subcategory/list/",
      "/website/other/medicine/list/",
      "/website/other/medicine/",
      "/website/medicine/",
      "/medicine/list/",
      "/medicine/product/list/",
      "/website/generic/medicine/",
      "/masterapp/care-group/",
    ];

    const isPublic = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isPublic && token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else if (isPublic && config.headers) {
      delete config.headers["Authorization"];
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 🔹 Response Interceptor
// api.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   async (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       const buyerRefreshToken = safeLocalStorage.getItem("buyerRefreshToken");
//       const adminRefreshToken = safeLocalStorage.getItem("refreshToken");
//       const refreshToken = buyerRefreshToken || adminRefreshToken;

//       if (refreshToken) {
//         try {
//           // ⚠️ when refresh endpoint added, put code here

//           // No refresh endpoint → trigger logout
//           if (onUnauthorized) onUnauthorized();
//           return Promise.reject(error);
//         } catch {
//           if (onUnauthorized) onUnauthorized();
//           return Promise.reject(error);
//         }
//       } else {
//         if (onUnauthorized) onUnauthorized();
//         return Promise.reject(error);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = error.response?.data;

    const message = data?.detail || data?.message || data?.error || "";

    /**
     * 🚨 TOKEN INVALID CASES
     * - 401 Unauthorized
     * - 403 Forbidden
     * - Backend custom "token expired" messages
     */
    if (
      status === 401 ||
      status === 403 ||
      (typeof message === "string" && message.toLowerCase().includes("token"))
    ) {
      if (onUnauthorized) {
        onUnauthorized();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
