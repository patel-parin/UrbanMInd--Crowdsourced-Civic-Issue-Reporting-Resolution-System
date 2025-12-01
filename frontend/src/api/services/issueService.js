// src/api/services/issueService.js
import api from "../axios";

export const issueService = {
  create: async (formData) => {
    const res = await api.post("/issue/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  getAll: async () => {
    const res = await api.get("/issue/all");
    return res.data;
  },

  getMyIssues: async () => {
    const res = await api.get("/issue/my-issues");
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/issue/${id}`);
    return res.data;
  },

  assignContractor: async (issueId, contractorId) => {
    const res = await api.post("/issue/assign", { issueId, contractorId });
    return res.data;
  },

  updateStatus: async (issueId, status) => {
    const res = await api.post("/issue/update-status", { issueId, status });
    return res.data;
  },

  getAssignedTasks: async () => {
    const res = await api.get("/contractor/assigned-tasks");
    return res.data;
  },

  requestFunds: async (issueId, amount) => {
    const res = await api.post("/issue/request-funds", { issueId, amount });
    return res.data;
  },

  approveFunds: async (issueId) => {
    const res = await api.post("/issue/approve-funds", { issueId });
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get("/contractor/profile");
    return res.data;
  },
};
