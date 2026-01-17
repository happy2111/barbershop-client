import { create } from "zustand";
import { authService } from "@/services/auth.service";

export interface User {
  id: number;
  phone: string;
  name: string | null;
  role: "ADMIN" | "SPECIALIST";
  companyId: number;
  photo?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;

  // state setters
  setUser: (user: User | null) => void;

  // derived state
  isAuth: () => boolean;
  isAdmin: () => boolean;
  isSpecialist: () => boolean;

  // actions
  initialize: () => Promise<void>;
  login: (phone: string, password: string) => Promise<boolean>;
  refresh: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const authStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  /* =======================
     Setters
  ======================= */
  setUser: (user) => set({ user }),

  /* =======================
     Derived state
  ======================= */
  isAuth: () => get().user !== null,
  isAdmin: () => get().user?.role === "ADMIN",
  isSpecialist: () => get().user?.role === "SPECIALIST",

  /* =======================
     Init (on app start)
  ======================= */
  async initialize() {
    set({ isLoading: true });

    try {
      const user = await authService.me();
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  /* =======================
     Login
  ======================= */
  async login(phone, password) {
    try {
      const hostname = window.location.hostname;
      const res = await authService.login({ phone, password, hostname });
      const { user } = res.data;

      set({ user });
      return true;
    } catch {
      return false;
    }
  },

  /* =======================
     Refresh session
  ======================= */
  async refresh() {
    try {
      const res = await authService.refresh();
      const { user } = res.data;

      set({ user });
      return true;
    } catch {
      set({ user: null });
      return false;
    }
  },

  /* =======================
     Logout
  ======================= */
  async logout() {
    try {
      await authService.logout();
    } finally {
      set({ user: null });
    }
  },
}));
