import { create } from "zustand";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";

// Добавляем тип для пользователя
interface User {
  id: number;
  phone: string;
  name: string | null;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;        // новый кусок состояния
  isLoading: boolean;

  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;           // удобно иметь отдельно
  setAuthData: (token: string | null, user: User | null) => void; // атомарно

  isAuth: () => boolean;
  isAdmin: () => boolean;        // пример удобных геттеров
  isSpecialist: () => boolean;

  login: (phone: string, password: string) => Promise<boolean>;
  refresh: () => Promise<boolean>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const authStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isLoading: true,
  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  setAuthData: (token, user) => set({ accessToken: token, user, isLoading: false }),
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
      const res = await authService.login({ phone, password });

      const { accessToken, user } = res.data;

      get().setAuthData(accessToken, user);
      console.log(
        "Login successful:", { accessToken, user }
      )
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
      Cookies.remove("refresh_token");
      set({ accessToken: null, user: null, isLoading: false });
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
}));