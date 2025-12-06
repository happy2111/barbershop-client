// src/services/profile.service.ts
import api from "./axiosInstance"; // твой существующий axios

export interface SpecialistProfile {
  id: number;
  name: string;
  phone: string;
  photo?: string;
  description?: string;
  skills?: string;
  services: Array<{
    id: number;
    name: string;
    price: number;
    duration_min: number;
    photo?: string;
  }>;
  schedules: Array<{
    id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
  bookings: Array<any>;
}

export interface ScheduleDto {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export const profileService = {
  // Получить весь профиль
  async getProfile(): Promise<SpecialistProfile> {
    return api.get("/profile").then((res) => res.data);
  },

  // Обновить личные данные
  async updateProfile(data: {
    name?: string;
    photo?: string;
    description?: string;
    skills?: string;
  }) {
    return api.patch("/profile", data).then((res) => res.data);
  },

  // Расписание
  async getSchedule() {
    return api.get("/profile/schedule").then((res) => res.data);
  },

  async upsertSchedule(dto: ScheduleDto) {
    return api.post("/profile/schedule", dto).then((res) => res.data);
  },

  async deleteSchedule(day: number) {
    return api.delete(`/profile/schedule/${day}`).then((res) => res.data);
  },

  // Брони
  async getUpcomingBookings() {
    return api.get("/profile/bookings/upcoming").then((res) => res.data);
  },

  async getPastBookings() {
    return api.get("/profile/bookings/past").then((res) => res.data);
  },
};