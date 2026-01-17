import axios, { AxiosError } from "axios";
import { authStore } from "@/stores/auth.store";
import { toast } from "sonner";
import {toErrorMessage, getLocaleFromPathname} from "@/lib/utils";


const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});


api.interceptors.request.use((config) => {
  const locale = getLocaleFromPathname();
  const initData = window.Telegram?.WebApp?.initData;

  config.headers["x-client-locale"] = locale;

  if (initData) {
    config.headers["x-telegram-init-data"] = initData;
  }

  return config;
});


api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;
    const msg = toErrorMessage(error.response?.data);

    if (originalRequest?.url?.includes("/auth/login")) {
      toast.error(msg);
      return Promise.reject(error);
    }

    // 401 → пробуем refresh
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
      } catch {
        authStore.getState().logout();
      }
    }

    toast.error(msg);
    return Promise.reject(error);
  }
);

export default api;
