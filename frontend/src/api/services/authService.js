// src/api/services/authService.js
import api from "../axios";

export const authService = {
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  register: async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  me: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  updateProfile: async (payload) => {
    const res = await api.put("/auth/update-profile", payload);
    return res.data.user;
  }
};
