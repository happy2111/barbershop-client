import api from "./axiosInstance";

export type Role = "ADMIN" | "SPECIALIST";

export interface Specialist {
  id: number;
  name: string;
  phone: string;
  role: Role;
  photo?: string | null;
  description?: string | null;
  skills?: string | null;
  refreshToken?: string | null;
}

export interface CreateSpecialistDto {
  name: string;
  phone: string;
  password: string;
  role?: Role;
  photo?: string | null;
  description?: string | null;
  skills?: string | null;
}

export interface UpdateSpecialistDto {
  name?: string;
  phone?: string;
  password?: string;
  role?: Role;
  photo?: string | null;
  description?: string | null;
  skills?: string | null;
}

export interface UpdateMeDto {
  name?: string;
  photo?: string | null;
  description?: string | null;
  skills?: string | null;
  password?: string;
}

export const specialistService = {
  // =====================
  // Admin CRUD
  // =====================
  getAll() {
    return api.get<Specialist[]>("/specialist").then(res => res.data);
  },

  getById(id: number) {
    return api.get<Specialist>(`/specialist/${id}`).then(res => res.data);
  },

  create(data: CreateSpecialistDto) {
    return api.post<Specialist>("/specialist", data).then(res => res.data);
  },

  update(id: number, data: UpdateSpecialistDto) {
    return api.patch<Specialist>(`/specialist/${id}`, data).then(res => res.data);
  },
  getByService(serviceId: any) {
    return api.get<Specialist[]>(`/specialist/by-service/${serviceId}`).then(res => res.data);
  },

  remove(id: number) {
    return api.delete<void>(`/specialist/${id}`).then(res => res.data);
  },

  // =====================
  // Specialist own profile
  // =====================
  getMe() {
    return api.get<Specialist>("/specialist/me/profile").then(res => res.data);
  },

  updateMe(data: UpdateMeDto) {
    return api.patch<Specialist>("/specialist/me/profile", data).then(res => res.data);
  },
};
