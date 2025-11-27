import api from "./axiosInstance";

export const authService = {
  login(data: { phone: string; password: string }) {
    return api.post("/auth/login", data);
  },

  refresh() {
    return api.get("/auth/refresh"); // refresh token берётся из cookie
  },

  logout() {
    return api.post("/auth/logout");
  },

  getProfile() {
    return api.get("/specialist/me/profile");
  }
};


