import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authStore } from "@/stores/auth.store";
import { toast } from "sonner";

// ==========================================
// Normalize error messages
// ==========================================
function toErrorMessage(payload: any): string {
  function asString(v: any): string | null {
    if (v == null) return null;
    if (typeof v === "string") return v.trim() || null;

    if (Array.isArray(v)) {
      const parts = v
        .map((x) => asString(x))
        .filter((x): x is string => Boolean(x));
      return parts.length ? Array.from(new Set(parts)).join(", ") : null;
    }

    if (typeof v === "object") {
      const keysToTry = ["message", "error", "detail", "description", "statusText"];
      for (const k of keysToTry) {
        const got = asString(v[k]);
        if (got) return got;
      }

      // Handle nested { message: { message: "..."} }
      if (v.message && typeof v.message === "object") {
        const nested =
          asString(v.message.message) || asString(v.message.error);
        if (nested) return nested;
      }
    }

    try {
      return JSON.stringify(v);
    } catch {}

    return "Server error";
  }

  return asString(payload) || "Server error";
}

// ==========================================
// Axios instance
// ==========================================
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// ==========================================
// Request interceptor: attach access token
// ==========================================
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getState().accessToken;
  const initData = window.Telegram?.WebApp?.initData;

  if (initData) {
    config.headers['x-telegram-init-data'] = initData;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ==========================================
// Response interceptor (errors + refresh)
// ==========================================
// api.ts

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;

    // 1. Извлекаем сообщение об ошибке
    const data = error.response?.data;
    const msg = toErrorMessage(data);

    // 2. Если это ошибка логина — просто выводим тост и выходим
    // Добавьте проверку на URL логина
    if (originalRequest?.url?.includes("/auth/login")) {
      toast.error(msg);
      return Promise.reject(error);
    }

    if (originalRequest?.url !== "/auth/refresh") {
      toast.error(msg);
    }

    // 3. REFRESH TOKEN LOGIC
    // Добавляем условие: не пытаться рефрешить, если мы и так на странице логина
    // или если это сам запрос рефреша
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const ok = await authStore.getState().refresh();
        if (ok) {
          return api(originalRequest);
        }
      } catch (e) {
        authStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
