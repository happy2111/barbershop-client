// src/services/dashboard.service.ts
import api from "./axiosInstance";

// Типы ответов от бэкенда (основаны на твоём DashboardService)

export interface RevenueResponse {
  period: string;
  revenue: number;
}

export interface GraphDataPoint {
  date: string; // "yyyy-MM-dd"
  value: number;
}

export interface BookingsCountResponse {
  period: string;
  count: number;
}

export interface SpecialistLoad {
  id: number;
  name: string;
  load: number;     // 0–100
  status: string;   // "" | "🔥" | "😴"
  bookedHours: number;
  totalHours: number;
}

export interface PopularService {
  name: string;
  value: number;    // количество или сумма
}

export interface LostMoneyResponse {
  count: number;
  lost: number;
}

export interface RepeatClientsResponse {
  newClients: number;
  repeatClients: number;
  repeatPercent: number;
  avgVisits: string;
}

export interface BestSpecialistResponse {
  name: string;
  value: number;
}

const dashboardService = {
  // Доход
  getRevenue: (period: "today" | "week" | "month" = "month") =>
    api.get<RevenueResponse>("/dashboard/revenue", { params: { period } })
      .then(res => res.data),

  getRevenueGraph: (days: number = 30) =>
    api.get<GraphDataPoint[]>("/dashboard/revenue-graph", { params: { days } })
      .then(res => res.data),

  // Кол-во бронирований
  getBookingsCount: (period: "today" | "tomorrow" | "month" = "month") =>
    api.get<BookingsCountResponse>("/dashboard/bookings-count", { params: { period } })
      .then(res => res.data),

  getBookingsGraph: (days: number = 30) =>
    api.get<GraphDataPoint[]>("/dashboard/bookings-graph", { params: { days } })
      .then(res => res.data),

  // Загрузка специалистов
  getSpecialistsLoad: (period: "week" | "month" = "month") =>
    api.get<SpecialistLoad[]>("/dashboard/specialists-load", { params: { period } })
      .then(res => res.data),

  // Популярные услуги
  getPopularServices: (
    top: number = 5,
    type: "count" | "revenue" = "count",
    period: "month" = "month"
  ) =>
    api.get<PopularService[]>("/dashboard/popular-services", {
      params: { top, type, period }
    }).then(res => res.data),

  // Потерянные деньги (отмены)
  getLostMoney: (period: "month" = "month") =>
    api.get<LostMoneyResponse>("/dashboard/lost-money", { params: { period } })
      .then(res => res.data),

  // Повторные клиенты
  getRepeatClients: (period: "month" = "month") =>
    api.get<RepeatClientsResponse>("/dashboard/repeat-clients", { params: { period } })
      .then(res => res.data),

  // Лучший специалист
  getBestSpecialist: (
    type: "revenue" | "clients" = "revenue",
    period: "month" = "month"
  ) =>
    api.get<BestSpecialistResponse>("/dashboard/best-specialist", {
      params: { type, period }
    }).then(res => res.data),

  // Средний чек
  getAverageCheck: (period: "month" = "month") =>
    api.get<number>("/dashboard/average-check", { params: { period } })
      .then(res => res.data),

  // Пиковые часы
  getPeakHours: (period: "month" = "month") =>
    api.get<{ peaks: string; lows: string }>("/dashboard/peak-hours", { params: { period } })
      .then(res => res.data),
};

export default dashboardService;