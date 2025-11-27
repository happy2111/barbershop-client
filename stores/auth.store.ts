import { create } from "zustand";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";

interface AuthState {
  accessToken: string | null;

  setAccessToken: (token: string | null) => void;

  login: (phone: string, password: string) => Promise<boolean>;
  refresh: () => Promise<boolean>;
  logout: () => void;
}

export const authStore = create<AuthState>((set, get) => ({
  accessToken: null,

  setAccessToken: (token) => set({ accessToken: token }),

  // =====================
  // LOGIN
  // =====================
  async login(phone, password) {
    try {
      const res = await authService.login({ phone, password });

      const accessToken = res.data.accessToken;

      set({ accessToken });

      return true;
    } catch (e) {
      return false;
    }
  },

  // =====================
  // REFRESH TOKEN
  // =====================
  async refresh() {
    try {
      const res = await authService.refresh();
      const newToken = res.data.accessToken;

      set({ accessToken: newToken });
      return true;
    } catch (e) {
      set({ accessToken: null });
      return false;
    }
  },

  // =====================
  // LOGOUT
  // =====================
  logout() {
    authService.logout().finally(() => {
      Cookies.remove("refresh_token");
      set({ accessToken: null });
    });
  },
}));
