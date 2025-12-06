import api from "@/services/axiosInstance";

export interface Specialist {
  id: number;
  fullName: string;
  phone: string;
  photo?: string | null;
  services?: any[];
}

export interface CreateSpecialistDto {
  fullName: string;
  phone: string;
  photo?: string;
}

export interface UpdateSpecialistDto {
  fullName?: string;
  phone?: string;
  photo?: string;
}

export const specialistService = {
  getAll() {
    return api.get<Specialist[]>("/specialist").then(res => res.data);
  },

  getById(id: number) {
    return api.get<Specialist>(`/specialist/${id}`).then(res => res.data);
  },

  getByService(serviceId: number) {
    return api.get<Specialist[]>(`/specialist/service/${serviceId}`).then(res => res.data);
  },

  create(data: CreateSpecialistDto) {
    return api.post<Specialist>("/specialist", data).then(res => res.data);
  },

  update(id: number, data: UpdateSpecialistDto) {
    return api.patch<Specialist>(`/specialist/${id}`, data).then(res => res.data);
  },

  remove(id: number) {
    return api.delete(`/specialist/${id}`).then(res => res.data);
  }
};
