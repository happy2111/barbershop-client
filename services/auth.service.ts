import api from "./axiosInstance";

export const authService = {
  login(data: { phone: string; password: string, hostname?: string }) {
    return api.post("/auth/login", data);
  },

  refresh() {
    return api.post("/auth/refresh");
  },

  logout() {
    return api.post("/auth/logout");
  },
};
