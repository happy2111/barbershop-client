import api from "./axiosInstance";

export interface Service {
  id: number;
  name: string;
  price: number;
  duration_min: number;
  categoryId: number;
  photo?: string | null;
  category?: {
    id: number;
    name: string;
  };
  bookings?: any[];
  specialists?: any[];
}

export interface CreateServiceDto {
  name: string;
  price: number;
  duration_min: number;
  categoryId: number;
  photo?: string;
}

export interface UpdateServiceDto {
  name?: string;
  price?: number;
  duration_min?: number;
  categoryId?: number;
  photo?: string;
}

export const serviceService = {
  getAll() {
    return api.get<Service[]>("/service").then(res => res.data);
  },

  getById(id: number) {
    return api.get<Service>(`/service/${id}`).then(res => res.data);
  },

  getByCategory(categoryId: number) {
    return api.get<Service[]>(`/service/by-category/${categoryId}`).then(res => res.data);
  },

  create(data: CreateServiceDto | FormData) {
    return api.post<Service>("/service", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },

  update(id: number, data: UpdateServiceDto | FormData) {
    const isFormData = data instanceof FormData;
    return api.patch<Service>(`/service/${id}`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : { "Content-Type": "application/json" },
    }).then(res => res.data);
  },

  remove(id: number) {
    return api.delete<void>(`/service/${id}`).then(res => res.data);
  },
};
