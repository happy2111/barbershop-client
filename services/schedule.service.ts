import api from "./axiosInstance";

export interface Schedule {
  id: number;
  specialistId: number;
  day_of_week: number; // 0-6
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
  specialist?: any;   // можно включить имя, фото и т.д.
}

export interface CreateScheduleDto {
  specialistId: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface UpdateScheduleDto {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
}

export const scheduleService = {
  getAll() {
    return api.get<Schedule[]>("/schedule").then(res => res.data);
  },

  getById(id: number) {
    return api.get<Schedule>(`/schedule/${id}`).then(res => res.data);
  },

  getBySpecialistId(specialistId: number) {
    return api.get<Schedule[]>(`/schedule/specialist/${specialistId}`).then(res => res.data);
  },

  create(data: CreateScheduleDto) {
    return api.post<Schedule>("/schedule", data).then(res => res.data);
  },

  update(id: number, data: UpdateScheduleDto) {
    return api.patch<Schedule>(`/schedule/${id}`, data).then(res => res.data);
  },

  remove(id: number) {
    return api.delete<void>(`/schedule/${id}`).then(res => res.data);
  },

  async getFreeSlots(specialistId: number, serviceId: number, date: string) {
    const hostname: string = window.location.hostname;
    return api.get<{ start: string; end: string }[]>(
      `/schedule/${specialistId}/free-slots?serviceId=${serviceId}&date=${date}&hostname=${hostname}`
    ).then(res => res.data);
  },
};
