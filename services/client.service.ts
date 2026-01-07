import api from "./axiosInstance";

export interface Client {
  id: number;
  name?: string;
  phone: string;
  bookings?: any[];
}

export interface CreateClientDto {
  name?: string;
  phone: string;
}

export interface UpdateClientDto {
  name?: string;
  phone?: string;
}

export const clientService = {
  // Получить всех клиентов
  getAll() {
    return api.get<Client[]>("/client").then(res => res.data);
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
