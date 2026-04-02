// src/api/services/issueService.js
import api from "../axios";

export const issueService = {
  create: async (formData) => {
    const res = await api.post("/issue/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  getAll: async (params) => {
    const res = await api.get("/issue/all", { params });
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

  submitCostEstimate: async (data) => {
    const res = await api.post("/issue/submit-cost-estimate", data);
    return res.data;
  },

  // Upvote toggle
  upvote: async (issueId) => {
    const res = await api.post("/issue/upvote", { issueId });
    return res.data;
  },

  // Submit feedback
  submitFeedback: async (issueId, rating, comment) => {
    const res = await api.post("/issue/feedback", { issueId, rating, comment });
    return res.data;
  },

  // Get nearby issues
  getNearby: async (lat, lng, radius = 10) => {
    const res = await api.get("/issue/nearby", { params: { lat, lng, radius } });
    return res.data;
  },

  // Check for duplicate issues
  checkDuplicates: async (title, lat, lng) => {
    const res = await api.get("/issue/check-duplicates", {
      params: { title, lat, lng }
    });
    return res.data;
  },
};
