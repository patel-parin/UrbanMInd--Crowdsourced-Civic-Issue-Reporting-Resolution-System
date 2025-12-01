// src/api/services/adminService.js
import api from "../axios";

export const adminService = {
  getAllIssues: async () => {
    const res = await api.get("/admin/issues");
    return res.data;
  },

  assignContractor: async (data) => {
    const res = await api.post("/admin/assign", data);
    return res.data;
  },

  getContractors: async () => {
    const res = await api.get("/admin/contractors");
    return res.data;
  },

  getStats: async () => {
    const res = await api.get("/admin/stats");
    return res.data;
  },
};
