// src/stores/dashboard.store.ts
import { create } from "zustand";
import dashboardService, {
  BestSpecialistResponse,
  BookingsCountResponse,
  GraphDataPoint, LostMoneyResponse, PopularService, RepeatClientsResponse,
  RevenueResponse, SpecialistLoad
} from "@/services/dashboard.service";
import { devtools } from "zustand/middleware"; // опционально — для удобства в devtools

// ────────────────────────────────────────────────
// Тип состояния
// ────────────────────────────────────────────────
interface DashboardState {
  // Данные
  revenue: RevenueResponse | null;
  revenueGraph: GraphDataPoint[] | null;
  bookingsCount: BookingsCountResponse | null;
  bookingsGraph: GraphDataPoint[] | null;
  specialistsLoad: SpecialistLoad[] | null;
  popularServices: PopularService[] | null;
  lostMoney: LostMoneyResponse | null;
  repeatClients: RepeatClientsResponse | null;
  bestSpecialist: BestSpecialistResponse | null;
  averageCheck: number | null;
  peakHours: { peaks: string; lows: string } | null;

  // Состояние загрузки и ошибок
  isLoading: Record<string, boolean>;
  errors: Record<string, string | null>;

  // Методы загрузки данных
  fetchRevenue: (period?: "today" | "week" | "month") => Promise<void>;
  fetchRevenueGraph: (days?: number) => Promise<void>;
  fetchBookingsCount: (period?: "today" | "tomorrow" | "month") => Promise<void>;
  fetchBookingsGraph: (days?: number) => Promise<void>;
  fetchSpecialistsLoad: (period?: "week" | "month") => Promise<void>;
  fetchPopularServices: (
    top?: number,
    type?: "count" | "revenue",
    period?: "month"
  ) => Promise<void>;
  fetchLostMoney: (period?: "month") => Promise<void>;
  fetchRepeatClients: (period?: "month") => Promise<void>;
  fetchBestSpecialist: (
    type?: "revenue" | "clients",
    period?: "month"
  ) => Promise<void>;
  fetchAverageCheck: (period?: "month") => Promise<void>;
  fetchPeakHours: (period?: "month") => Promise<void>;

  // Утилиты
  reset: () => void;
}

// ────────────────────────────────────────────────
// Создание стора
// ────────────────────────────────────────────────
export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      // Начальные значения
      revenue: null,
      revenueGraph: null,
      bookingsCount: null,
      bookingsGraph: null,
      specialistsLoad: null,
      popularServices: null,
      lostMoney: null,
      repeatClients: null,
      bestSpecialist: null,
      averageCheck: null,
      peakHours: null,

      isLoading: {},
      errors: {},

      // ─── Доход ───────────────────────────────────────
      async fetchRevenue(period = "month") {
        const key = `revenue_${period}`;
        set(state => ({ isLoading: { ...state.isLoading, [key]: true }, errors: { ...state.errors, [key]: null } }));

        try {
          const data = await dashboardService.getRevenue(period);
          set({ revenue: data });
        } catch (err: any) {
          set(state => ({
            errors: { ...state.errors, [key]: err.message || "Ошибка загрузки дохода" }
          }));
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, [key]: false } }));
        }
      },

      async fetchRevenueGraph(daysInput = 30) {

        // 1. Ensure it's an integer
        // 2. Clamp the value between 7 and 365
        const days = Math.min(Math.max(Math.floor(daysInput), 7), 365);

        const key = `revenueGraph_${days}`;
        set(state => ({ isLoading: { ...state.isLoading, [key]: true }, errors: { ...state.errors, [key]: null } }));

        try {
          const data = await dashboardService.getRevenueGraph(days);
          set({ revenueGraph: data });
        } catch (err: any) {
          const apiMessages = err.response?.data?.message;
          const errorMessage = Array.isArray(apiMessages)
            ? apiMessages.join(". ")
            : "Ошибка загрузки графика дохода";

          set(state => ({
            errors: { ...state.errors, [key]: errorMessage }
          }));
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, [key]: false } }));
        }
      },

      // ─── Кол-во бронирований ─────────────────────────
      async fetchBookingsCount(period = "month") {
        const key = `bookingsCount_${period}`;
        set(state => ({ isLoading: { ...state.isLoading, [key]: true }, errors: { ...state.errors, [key]: null } }));

        try {
          const data = await dashboardService.getBookingsCount(period);
          set({ bookingsCount: data });
        } catch (err: any) {
          set(state => ({
            errors: { ...state.errors, [key]: err.message || "Ошибка загрузки количества бронирований" }
          }));
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, [key]: false } }));
        }
      },

      async fetchBookingsGraph(days = 30) {
        const key = `bookingsGraph_${days}`;
        set(state => ({ isLoading: { ...state.isLoading, [key]: true }, errors: { ...state.errors, [key]: null } }));

        try {
          const data = await dashboardService.getBookingsGraph(days);
          set({ bookingsGraph: data });
        } catch (err: any) {
          set(state => ({
            errors: { ...state.errors, [key]: err.message || "Ошибка загрузки графика бронирований" }
          }));
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, [key]: false } }));
        }
      },

      // ─── Загрузка специалистов ───────────────────────
      async fetchSpecialistsLoad(period = "month") {
        const key = `specialistsLoad_${period}`;
        set(state => ({ isLoading: { ...state.isLoading, [key]: true }, errors: { ...state.errors, [key]: null } }));

        try {
          const data = await dashboardService.getSpecialistsLoad(period);
          set({ specialistsLoad: data });
        } catch (err: any) {
          set(state => ({
            errors: { ...state.errors, [key]: err.message || "Ошибка загрузки загрузки мастеров" }
          }));
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, [key]: false } }));
        }
      },

      // ─── Популярные услуги ───────────────────────────
      async fetchPopularServices(top = 5, type = "count", period = "month") {
        const key = `popularServices_${type}_${top}`;
        set(state => ({ isLoading: { ...state.isLoading, [key]: true }, errors: { ...state.errors, [key]: null } }));

        try {
          const data = await dashboardService.getPopularServices(top, type, period);
          set({ popularServices: data });
        } catch (err: any) {
          set(state => ({
            errors: { ...state.errors, [key]: err.message || "Ошибка загрузки популярных услуг" }
          }));
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, [key]: false } }));
        }
      },

      // ─── Потерянные деньги ───────────────────────────
      async fetchLostMoney(period = "month") {
        const key = `lostMoney_${period}`;
        set(state => ({ isLoading: { ...state.isLoading, [key]: true }, errors: { ...state.errors, [key]: null } }));

        try {
          const data = await dashboardService.getLostMoney(period);
          set({ lostMoney: data });
        } catch (err: any) {
          set(state => ({
            errors: { ...state.errors, [key]: err.message || "Ошибка загрузки потерянных денег" }
          }));
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, [key]: false } }));
        }
      },

      // ─── Повторные клиенты ───────────────────────────
      async fetchRepeatClients(period = "month") {
        const key = `repeatClients_${period}`;
        set(state => ({ isLoading: { ...state.isLoading, [key]: true }, errors: { ...state.errors, [key]: null } }));

        try {
          const data = await dashboardService.getRepeatClients(period);
          set({ repeatClients: data });
        } catch (err: any) {
          set(state => ({
            errors: { ...state.errors, [key]: err.message || "Ошибка загрузки повторных клиентов" }
          }));
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, [key]: false } }));
        }
      },

      // ─── Лучший специалист ───────────────────────────
      async fetchBestSpecialist(type = "revenue", period = "month") {
        const key = `bestSpecialist_${type}`;
        set(state => ({ isLoading: { ...state.isLoading, [key]: true }, errors: { ...state.errors, [key]: null } }));

        try {
          const data = await dashboardService.getBestSpecialist(type, period);
          set({ bestSpecialist: data });
        } catch (err: any) {
          set(state => ({
            errors: { ...state.errors, [key]: err.message || "Ошибка загрузки лучшего специалиста" }
          }));
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, [key]: false } }));
        }
      },

      // ─── Средний чек ─────────────────────────────────
      async fetchAverageCheck(period = "month") {
        const key = `averageCheck_${period}`;
        set(state => ({ isLoading: { ...state.isLoading, [key]: true }, errors: { ...state.errors, [key]: null } }));

        try {
          const data = await dashboardService.getAverageCheck(period);
          set({ averageCheck: data });
        } catch (err: any) {
          set(state => ({
            errors: { ...state.errors, [key]: err.message || "Ошибка загрузки среднего чека" }
          }));
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, [key]: false } }));
        }
      },

      // ─── Пиковые часы ────────────────────────────────
      async fetchPeakHours(period = "month") {
        const key = `peakHours_${period}`;
        set(state => ({ isLoading: { ...state.isLoading, [key]: true }, errors: { ...state.errors, [key]: null } }));

        try {
          const data = await dashboardService.getPeakHours(period);
          set({ peakHours: data });
        } catch (err: any) {
          set(state => ({
            errors: { ...state.errors, [key]: err.message || "Ошибка загрузки пиковых часов" }
          }));
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, [key]: false } }));
        }
      },

      // Сброс всего состояния
      reset: () => {
        set({
          revenue: null,
          revenueGraph: null,
          bookingsCount: null,
          bookingsGraph: null,
          specialistsLoad: null,
          popularServices: null,
          lostMoney: null,
          repeatClients: null,
          bestSpecialist: null,
          averageCheck: null,
          peakHours: null,
          isLoading: {},
          errors: {},
        });
      },
    }),
    { name: "DashboardStore" } // имя для devtools
  )
);