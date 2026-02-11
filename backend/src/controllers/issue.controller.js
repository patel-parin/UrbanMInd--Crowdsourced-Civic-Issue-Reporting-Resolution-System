import Issue from "../models/Issue.js";
import Contractor from "../models/Contractor.js";
import User from "../models/User.js";
import { classifyImage } from "../utils/aiClassifier.js";
import fetch from "node-fetch";
import { sendIssueStatusEmail } from "../services/emailService.js";


export const createIssue = async (req, res) => {
  try {
    const { title, description, lat, lng, address, priority } = req.body;

    // Handle Images (Multiple)
    let images = [];
    if (req.files?.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      for (const file of files) {
        const path = `/uploads/${Date.now()}_${file.name}`;
        await file.mv("." + path);
        images.push(path);
      }
    }

    // Handle Voice Note
    let voiceNoteUrl = "";
    if (req.files?.voiceNote) {
      const file = req.files.voiceNote;
      voiceNoteUrl = `/uploads/${Date.now()}_${file.name}`;
      await file.mv("." + voiceNoteUrl);
    }

    // 🔥 Real reverse geocoding
    const city = await getCityFromCoordinates(lat, lng);

    const issue = await Issue.create({
      userId: req.user.id,
      title,
      description,
      images,
      voiceNoteUrl,
      priority: priority || "medium",
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
    const query = {};

    // Super Admin sees everything
    if (req.user.role === 'superadmin') {
      // No filter
    } else {
      // Filter by city if user has one, otherwise show all (or maybe limit?)
      // For now, to ensure data shows up, we'll only filter if both user and issue have city data
      if (req.user.city && req.user.city !== 'Unknown') {
        // Optional: make this less strict or allow viewing all for now
        // query.city = req.user.city; 
        // Commenting out strict filtering to ensure "Live City Issues" works for demo
      }
    }

    const issues = await Issue.find(query)
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

export const submitCostEstimate = async (req, res) => {
  try {
    const { issueId, materials, labor, equipment, description } = req.body;
    const issue = await Issue.findById(issueId);

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const total = Number(materials) + Number(labor) + Number(equipment);

    issue.costEstimate = {
      materials,
      labor,
      equipment,
      total,
      description
    };

    // Auto-update fund amount request based on estimate
    issue.fundAmount = total;
    issue.status = "fund_approval_pending";

    await issue.save();

    res.json({ message: "Cost estimate submitted", issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const approveFunds = async (req, res) => {
  try {
    const { issueId } = req.body;
    const issue = await Issue.findById(issueId);

    if (!issue) return res.status(404).json({ message: "Issue not found" });

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
    ).populate("userId", "email name");

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // Send email notification
    if (issue.userId && issue.userId.email) {
      await sendIssueStatusEmail(issue.userId.email, issue.title, status, issue._id);
    }

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