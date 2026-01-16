import api from "./axiosInstance";

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface Booking {
  id: number;
  clientId: number;
  specialistId: number;
  date: string;       // ISO string
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
  status: BookingStatus;
  isSystem: boolean;
  reason?: string;
  client?: any;
  specialist?: any;
  services?: Array<{
    service: {
      id: number;
      name: string;
      price: number;
      duration_min: number;
    };
  }>;
}

export interface UpdateBookingDto {
  clientId?: number;
  specialistId?: number;
  serviceIds?: number[]; // массив ID выбранных услуг
  date?: string;
  start_time?: string;
  end_time?: string;
  status?: BookingStatus;
  reason?: string;
}

export interface CreateBookingDto {
  clientId: number;
  specialistId: number;
  serviceIds: number[];
  date: string;
  start_time: string;
  end_time: string;
  status?: BookingStatus;
  reason?: string;
}


export const bookingService = {
  getAll() {
    const hostname: string = window.location.hostname;
    return api.get<Booking[]>("/booking", {params: {hostname}}).then(res => res.data);
  },

  getById(id: number) {
    return api.get<Booking>(`/booking/${id}`).then(res => res.data);
  },

  create(data: CreateBookingDto) {
    const hostname: string = window.location.hostname;
    return api.post<Booking>("/booking", data, {params: {hostname}}).then(res => res.data);
  },

  update(id: number, data: UpdateBookingDto) {
    return api.patch<Booking>(`/booking/${id}`, data).then(res => res.data);
  },

  updateStatus(id: number, status: BookingStatus) {
    const hostname: string = window.location.hostname;

    return api.patch<Booking>(`/booking/${id}/status/${status}`,{}, {params: {hostname}}).then(res => res.data);
  },

  remove(id: number) {
    return api.delete<void>(`/booking/${id}`).then(res => res.data);
  },

  getFreeSlots(specialistId: number, serviceIds: number[], date: string) {
    const hostname: string = window.location.hostname;
    return api
      .get(`/schedule/${specialistId}/free-slots`, {
        params: {
          serviceIds: serviceIds.join(','), // массив в строку "1,2,3"
          date,
          hostname
        }
      })
      .then((res) => res.data);
  },
  block(date: string, start_time: string, end_time: string, reason?: string) {
    return api.post(`/booking/block`, { date, start_time, end_time, reason }).then((res) => res.data);
  },

  getBlockedTimes() {
    return api.get(`/booking/blocked`).then((res) => res.data);
  }
};
