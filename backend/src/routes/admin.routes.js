import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { roleCheck } from "../middleware/roleMiddleware.js";
import { assignToContractor } from "../controllers/admin.controller.js";

const router = express.Router();

router.post(
  "/assign",
  protect,
  roleCheck(["admin"]),
  assignToContractor
);

export default router;
