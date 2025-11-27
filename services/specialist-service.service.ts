import api from "./axiosInstance";

export interface SpecialistService {
  id: number;
  specialistId: number;
  serviceId: number;
  // можно добавить расширенные данные, если backend отдаёт relations
  specialist?: any;
  service?: any;
}

export interface CreateSpecialistServiceDto {
  specialistId: number;
  serviceId: number;
}

export const specialistServiceService = {
  getAll() {
    return api.get<SpecialistService[]>("/specialist-service").then(res => res.data);
  },

  getById(id: number) {
    return api.get<SpecialistService>(`/specialist-service/${id}`).then(res => res.data);
  },

  create(data: CreateSpecialistServiceDto) {
    return api.post<SpecialistService>("/specialist-service", data).then(res => res.data);
  },

  update(id: number, data: Partial<CreateSpecialistServiceDto>) {
    return api.patch<SpecialistService>(`/specialist-service/${id}`, data).then(res => res.data);
  },

  remove(id: number) {
    return api.delete<void>(`/specialist-service/${id}`).then(res => res.data);
  }
};
