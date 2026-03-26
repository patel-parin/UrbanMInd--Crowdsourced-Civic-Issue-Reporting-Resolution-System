import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getLeaderboard, getMyGamificationStats } from "../controllers/gamification.controller.js";

const router = express.Router();

router.get("/leaderboard", protect, getLeaderboard);
router.get("/my-stats", protect, getMyGamificationStats);

export default router;
