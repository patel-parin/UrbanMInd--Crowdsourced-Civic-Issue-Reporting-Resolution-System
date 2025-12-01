import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllContractors, getAssignedTasks, updateTaskStatus, getContractorProfile } from "../controllers/contractor.controller.js";

const router = express.Router();

router.get("/all", protect, getAllContractors);
router.get("/assigned-tasks", protect, getAssignedTasks);
router.post("/update", protect, updateTaskStatus);
router.get("/profile", protect, getContractorProfile);

export default router;
