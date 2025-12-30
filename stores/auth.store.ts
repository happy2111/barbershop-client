import { create } from "zustand";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";
import {number} from "zod";

// Добавляем тип для пользователя
interface User {
  id: number;
  phone: string;
  name: string | null;
  role: string;
  companyId: number | null;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  companyId: number | null;

  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setAuthData: (token: string | null, user: User | null) => void;

  isAuth: () => boolean;
  isAdmin: () => boolean;
  isSpecialist: () => boolean;

  login: (phone: string, password: string) => Promise<boolean>;
  refresh: () => Promise<boolean>;
  logout: () => void;
  initialize: () => Promise<void>;
  initializeCompanyId: () => void;
}

export const authStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isLoading: true,
  companyId: null,

  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  setAuthData: (token, user) => {
    set({
      accessToken: token,
      user,
      companyId: user?.companyId ?? null,
      isLoading: false
    });

    if (user?.companyId) {
      localStorage.setItem("companyId", user.companyId.toString());
    }
  },
  isAuth: () => !!get().accessToken,
  isAdmin: () => get().user?.role === "ADMIN",
  isSpecialist: () => get().user?.role === "SPECIALIST",

  async initialize() {
    const refreshToken = Cookies.get("refresh_token");
    if (!refreshToken) {
      set({ isLoading: false });
      return;
    }

    await get().refresh(); // refresh сам проставит user и token
  },

  async login(phone, password) {
    try {
      const hostname = window.location.hostname;

      const res = await authService.login({ phone, password, hostname });
      const { accessToken, user } = res.data;

      get().setAuthData(accessToken, user);

      return true;
    } catch (e) {
      set({ isLoading: false });
      return false;
    }
  },

  async refresh() {
    try {
      const res = await authService.refresh();
      const { accessToken, user } = res.data; // <-- предполагаем, что refresh тоже возвращает user

      get().setAuthData(accessToken, user);

      return true;
    } catch (e) {
      Cookies.remove("refresh_token");
      set({ accessToken: null, user: null, isLoading: false });
      return false;
    }
  },

  logout() {
    authService.logout().finally(() => {
      // Очищаем всё разом
      set({ accessToken: null, user: null, companyId: null, isLoading: false });
      localStorage.removeItem("companyId");
    });
  },

  requireAdmin: () => {
    const state = get();
    if (!state.accessToken || state.user?.role !== "ADMIN") {
      return false;
    }
    return true;
  },
  getRole: () => get().user?.role ?? null,

  initializeCompanyId: () => {
    const saved = localStorage.getItem("companyId");
    if (saved) set({ companyId: parseInt(saved, 10) });
  }

}));