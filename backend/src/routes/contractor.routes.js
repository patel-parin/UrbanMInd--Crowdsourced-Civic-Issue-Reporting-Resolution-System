import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { roleCheck } from "../middleware/roleMiddleware.js";
import { updateTaskStatus } from "../controllers/contractor.controller.js";

const router = express.Router();

router.post(
  "/update",
  protect,
  roleCheck(["contractor"]),
  updateTaskStatus
);

export default router;
