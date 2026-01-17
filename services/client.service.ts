import api from "./axiosInstance";
import {PaginatedResponse} from "@/services/booking.service";

export interface Client {
  id: number;
  name?: string;
  phone: string;
  local: 'ru' | 'uz';
  telegramId?: string | number;
  lastMarketingSentAt?: string;
  createdAt: string;
  _count?: {
    bookings: number;
  };
  bookings?: any[];
}

export interface CreateClientDto {
  name?: string;
  phone: string;
  telegramId?: string;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  telegramLang?: string;
}

export interface UpdateClientDto {
  name?: string;
  phone?: string;
}

export const clientService = {
  // Получить всех клиентов
  getAll(page: number = 1, limit: number = 10) {
    return api
      .get<PaginatedResponse<Client>>("/client", {
        params: {
          page,
          limit
        }
      })
      .then(res => res.data);
  },
  // Получить одного клиента по ID
  getById(id: number) {
    return api.get<Client>(`/client/${id}`).then(res => res.data);
  },

  // Поиск клиента по телефону
  searchByPhone(phone: string) {
    return api
      .get<Client[]>(`/client/search/phone`, { params: { phone } })
      .then(res => res.data);
  },

  // Создать нового клиента
  create(data: CreateClientDto) {
    const hostname: string = window.location.hostname;
    return api.post<Client>("/client", data, {params: {hostname}}).then(res => res.data);
  },

  // Обновить существующего клиента
  update(id: number, data: UpdateClientDto) {
    return api.patch<Client>(`/client/${id}`, data).then(res => res.data);
  },

  // Удалить клиента
  remove(id: number) {
    return api.delete<void>(`/client/${id}`).then(res => res.data);
  },
};
