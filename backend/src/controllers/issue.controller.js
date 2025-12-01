import Issue from "../models/Issue.js";
import Contractor from "../models/Contractor.js";
import User from "../models/User.js";
import { classifyImage } from "../utils/aiClassifier.js";
import fetch from "node-fetch";


export const createIssue = async (req, res) => {
  try {
    const { title, description, lat, lng, address } = req.body;

    const imageFile = req.files?.image;
    let imageUrl = "";
    if (imageFile) {
      imageUrl = `/uploads/${Date.now()}_${imageFile.name}`;
      await imageFile.mv("." + imageUrl);
    }

    // 🔥 Real reverse geocoding
    const city = await getCityFromCoordinates(lat, lng);

    const issue = await Issue.create({
      userId: req.user.id,
      title,
      description,
      imageUrl,
      category: "General",
      gps: { lat, lng, address },
      city
    });

    const user = await User.findById(req.user.id);
    if (user) {
      user.impactPoints += 10;
      user.citizenLevel = Math.floor(user.impactPoints / 100) + 1;
      await user.save();
    }

    res.json({ message: "Issue reported", issue });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("userId", "name email")
      .populate("contractorId", "companyName")
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const requestFunds = async (req, res) => {
  try {
    const { issueId, amount } = req.body;
    const issue = await Issue.findById(issueId);

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    issue.fundAmount = amount;
    issue.status = "fund_approval_pending";
    await issue.save();

    res.json({ message: "Funds requested successfully", issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const approveFunds = async (req, res) => {
  try {
    const { issueId } = req.body;
    const issue = await Issue.findById(issueId);

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // Logic: If amount > 1000, only Super Admin can approve
    // if (issue.fundAmount > 1000 && req.user.role !== 'superadmin') {
    //   return res.status(403).json({ message: "Amount exceeds limit. Requires Super Admin approval." });
    // }

    issue.fundApproved = true;
    issue.status = "in_progress"; // Funds approved, work starts
    await issue.save();

    res.json({ message: "Funds approved. Work can start.", issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const assignIssue = async (req, res) => {
  try {
    const { issueId, contractorId } = req.body;

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const contractor = await Contractor.findById(contractorId);
    if (!contractor) return res.status(404).json({ message: "Contractor not found" });

    issue.contractorId = contractorId;
    issue.status = "assigned";
    await issue.save();

    // Add to contractor's assigned tasks if not already present
    if (!contractor.assignedTasks.includes(issueId)) {
      contractor.assignedTasks.push(issueId);
      await contractor.save();
    }

    res.json({ message: "Issue assigned successfully", issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { issueId, status } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      issueId,
      { status },
      { new: true }
    );

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    res.json({ message: "Status updated", issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mock Reverse Geocoding
export const getCityFromCoordinates = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
    const response = await fetch(url);
    const data = await response.json();

    return (
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.address?.suburb ||
      data?.address?.state_district ||
      data?.address?.county ||
      "Unknown City"
    );
  } catch (error) {
    console.log("Reverse geocoding failed:", error);
    return "Unknown City";
  }
};

export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};