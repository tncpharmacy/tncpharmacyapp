import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { safeLocalStorage } from "@/lib/utils/safeLocalStorage"; // << add this

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

// 🔹 Unauthorized callback
let onUnauthorized: ((url?: string) => void) | null = null;
export const setUnauthorizedHandler = (handler: (url?: string) => void) => {
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
      "/website/product/search-suggestion/",
      "/website/manufacturer/search/",
    ];

    const url = config.url || "";
    const csrfToken = getCookie("csrftoken");
    if (csrfToken && config.headers) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
    const isPublic =
      url.includes("/medicine") ||
      url.includes("/masterapp/care-group/") ||
      url.includes("/website") ||
      url.includes("search-suggestion") ||
      publicEndpoints.some((endpoint) => url.includes(endpoint));

    if (!isPublic && token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // if (isPublic && config.headers) {
    //   delete config.headers["Authorization"];
    // }
    if (
      url.includes("search-suggestion") ||
      url.includes("manufacturer/search")
    ) {
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
    const url = error.config?.url || "";
    const message = data?.detail || data?.message || data?.error || "";
    // 🔥 ✅ ADD THIS BLOCK HERE (TOP PE)
    if (url.includes("manufacturer/search")) {
      // console.log("🚫 Ignoring manufacturer API error");
      return Promise.reject(error); // ❌ logout mat kar
    }
    /**
     * 🚨 TOKEN INVALID CASES
     * - 401 Unauthorized
     * - 403 Forbidden
     * - Backend custom "token expired" messages
     */
    if (error.response?.status === 401) {
      onUnauthorized?.(error.config?.url); // ✅ URL pass karo
    }

    return Promise.reject(error);
  }
);

export default api;
