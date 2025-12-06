import { create } from "zustand";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";

interface AuthState {
  accessToken: string | null;
  isLoading: boolean; // важно: пока идёт проверка — лоадинг

  setAccessToken: (token: string | null) => void;
  isAuth: () => boolean;

  login: (phone: string, password: string) => Promise<boolean>;
  refresh: () => Promise<boolean>;
  logout: () => void;

  // Новый метод: проверить и восстановить сессию
  initialize: () => Promise<void>;
}

export const authStore = create<AuthState>((set, get) => ({
  accessToken: null,
  isLoading: true,

  setAccessToken: (token) => set({ accessToken: token }),

  isAuth: () => {
    const { accessToken } = get();
    return !!accessToken;
  },


  async initialize() {
    const refreshToken = Cookies.get("refresh_token");

    if (!refreshToken) {
      set({ isLoading: false });
      return;
    }

    const success = await get().refresh();
    set({ isLoading: !success }); // если refresh не удался — isLoading = false
  },

  async login(phone, password) {
    try {
      const res = await authService.login({ phone, password });
      const accessToken = res.data.accessToken;

      set({ accessToken, isLoading: false });
      return true;
    } catch (e) {
      set({ isLoading: false });
      return false;
    }
  },

  async refresh() {
    try {
      const res = await authService.refresh();
      const newToken = res.data.accessToken;

      set({ accessToken: newToken, isLoading: false });
      return true;
    } catch (e) {
      set({ accessToken: null, isLoading: false });
      Cookies.remove("refresh_token");
      return false;
    }
  },

  logout() {
    authService.logout().finally(() => {
      Cookies.remove("refresh_token");
      set({ accessToken: null, isLoading: false });
    });
  },
}));