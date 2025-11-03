import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// 🔹 Unauthorized callback (circular-safe)
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

// 🔹 Request interceptor → attach token (Admin + Buyer both)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const buyerToken = localStorage.getItem("buyerAccessToken");
      const adminToken = localStorage.getItem("accessToken");
      const token = buyerToken || adminToken;

      // 👇 Public endpoints list (jahan Authorization nahi chahiye)
      const publicEndpoints = [
        // 🏷️ Category / Subcategory
        "/masterapp/category/",
        "/masterapp/subcategory/",
        "/masterapp/category/list/",
        "/masterapp/subcategory/list/",
        // 💊 Medicines (public listings)
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

      // 🔹 Sirf non-public endpoints ke liye token bhejna
      if (!isPublic && token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      } else if (isPublic && config.headers) {
        delete config.headers["Authorization"];
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 🔹 Response interceptor → handle 401 Unauthorized (for both)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const buyerRefreshToken = localStorage.getItem("buyerRefreshToken");
      const adminRefreshToken = localStorage.getItem("refreshToken");

      // Prefer buyer refresh token if exists
      const refreshToken = buyerRefreshToken || adminRefreshToken;

      if (refreshToken) {
        try {
          // ⚠️ Future: backend refresh token endpoint (both supported)
          /*
          const res = await axios.post<{ access: string }>(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
            { refresh: refreshToken }
          );
          const newAccessToken = res.data.access;

          if (buyerRefreshToken) {
            localStorage.setItem("buyerAccessToken", newAccessToken);
          } else {
            localStorage.setItem("accessToken", newAccessToken);
          }

          if (error.config?.headers) {
            error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          }

          return api.request(error.config!); // retry request
          */

          // ❌ Currently no refresh endpoint → trigger logout handler
          if (onUnauthorized) onUnauthorized();
          return Promise.reject(error);
        } catch {
          if (onUnauthorized) onUnauthorized();
          return Promise.reject(error);
        }
      } else {
        // ❌ No refresh token → logout
        if (onUnauthorized) onUnauthorized();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
