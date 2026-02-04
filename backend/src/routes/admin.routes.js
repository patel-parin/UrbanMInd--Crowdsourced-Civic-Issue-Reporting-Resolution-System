import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { roleCheck } from "../middleware/roleMiddleware.js";
import { assignToContractor, getContractors } from "../controllers/admin.controller.js";
import { superAdminOnly } from "../middleware/superAdminMiddleware.js";
import { getAdminStats } from "../controllers/admin.controller.js";
import { resetUserPassword } from "../controllers/admin.controller.js";
const router = express.Router();

router.get("/stats", protect, getAdminStats);

router.get("/contractors", protect, roleCheck(["admin"]), getContractors);

router.post(
  "/assign",
  protect,
  roleCheck(["admin"]),
  assignToContractor
);


router.post(
  "/reset-password",
  protect,
  superAdminOnly,
  resetUserPassword
);



export default router;
