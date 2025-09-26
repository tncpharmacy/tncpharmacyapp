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

// 🔹 Request interceptor → attach access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 🔹 Response interceptor → handle 401 Unauthorized
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // ⚠️ Future: backend refresh token endpoint
          /*
          const res = await axios.post<{ access: string }>(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
            { refresh: refreshToken }
          );
          const newAccessToken = res.data.access;
          localStorage.setItem("accessToken", newAccessToken);

          if (error.config?.headers) {
            error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          }

          return api.request(error.config!); // retry original request
          */

          // ❌ Current: no refresh endpoint → logout
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
