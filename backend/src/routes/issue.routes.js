import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createIssue } from "../controllers/issue.controller.js";

const router = express.Router();

router.post("/create", protect, createIssue);

export default router;
