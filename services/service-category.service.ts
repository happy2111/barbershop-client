import api from "./axiosInstance";

export interface ServiceCategory {
  id: number;
  name: string;
  services?: any[]; // можно заменить на Service[], если есть интерфейс Service
}

export interface CreateServiceCategoryDto {
  name: string;
}

export interface UpdateServiceCategoryDto {
  name?: string;
}

export const serviceCategoryService = {
  getAll() {
    return api.get<ServiceCategory[]>("/service-category").then(res => res.data);
  },

  getById(id: number) {
    return api.get<ServiceCategory>(`/service-category/${id}`).then(res => res.data);
  },

  create(data: CreateServiceCategoryDto) {
    return api.post<ServiceCategory>("/service-category", data).then(res => res.data);
  },

  update(id: number, data: UpdateServiceCategoryDto) {
    return api.patch<ServiceCategory>(`/service-category/${id}`, data).then(res => res.data);
  },

  remove(id: number) {
    return api.delete<void>(`/service-category/${id}`).then(res => res.data);
  }
};
