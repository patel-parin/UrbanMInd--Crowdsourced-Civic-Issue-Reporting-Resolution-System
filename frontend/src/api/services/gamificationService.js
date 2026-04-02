// src/api/services/gamificationService.js
import api from "../axios";

export const gamificationService = {
  getLeaderboard: async (city) => {
    const res = await api.get("/gamification/leaderboard", {
      params: city ? { city } : {}
    });
    return res.data;
  },

  getMyStats: async () => {
    const res = await api.get("/gamification/my-stats");
    return res.data;
  },
};
