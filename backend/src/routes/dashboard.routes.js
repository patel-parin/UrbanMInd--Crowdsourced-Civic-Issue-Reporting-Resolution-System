import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getCitizenStats,
  getCitizenRecentIssues,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats", protect, getCitizenStats);
router.get("/my-issues", protect, getCitizenRecentIssues);

export default router;
