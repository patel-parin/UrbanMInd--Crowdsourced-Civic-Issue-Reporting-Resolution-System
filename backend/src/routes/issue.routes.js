import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createIssue, requestFunds, approveFunds, getAllIssues, assignIssue, updateIssueStatus } from "../controllers/issue.controller.js";
import { getIssueById } from "../controllers/issue.controller.js";
import { getMyIssues } from "../controllers/issue.controller.js";



const router = express.Router();

router.post("/create", protect, createIssue);
router.post("/request-funds", protect, requestFunds);
router.post("/approve-funds", protect, approveFunds);
router.post("/assign", protect, assignIssue);
router.post("/update-status", protect, updateIssueStatus);
router.get("/all", protect, getAllIssues);
router.get("/my-issues", protect, getMyIssues);

router.get("/:id", protect, getIssueById);


export default router;
