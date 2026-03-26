import Issue from "../models/Issue.js";
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
      city: city || "Unknown City" // Ensure fallback
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
    } else if (req.user.role === 'admin') {
      // City Admin sees their city AND Unknown City issues (to catch failed geocodes)
      if (req.user.city && req.user.city !== 'Unknown') {
        const cityRegex = new RegExp(`^${req.user.city}$`, 'i');
        query.$or = [
          { city: cityRegex },
          { city: "Unknown City" },
          { city: null }
        ];
      }
    } else if (req.user.role === 'citizen') {
      // Citizens see issues in their city (for map and list)
      // If lat/lng provided, use that to determine city
      if (req.query.lat && req.query.lng) {
        const cityIndex = await getCityFromCoordinates(req.query.lat, req.query.lng);
        if (cityIndex && cityIndex !== 'Unknown City') {
          query.city = new RegExp(`^${cityIndex}$`, 'i');
        } else if (req.user.city && req.user.city !== 'Unknown') {
          query.city = new RegExp(`^${req.user.city}$`, 'i');
        }
      } else if (req.user.city && req.user.city !== 'Unknown') {
        // Fallback to user profile city
        query.city = new RegExp(`^${req.user.city}$`, 'i');
      }
    }

    const issues = await Issue.find(query)
      .populate("userId", "name email")
      .populate("contractorId", "name companyName") // Now referencing User model
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
    const { issueId, materials, labor, equipment, description, purpose, workType, materialsList, timeline, notes } = req.body;
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

    // Enhanced fund request details
    issue.fundRequest = {
      purpose: purpose || "",
      workType: workType || "",
      materialsList: materialsList || [],
      timeline: timeline || 0,
      notes: notes || ""
    };

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

    const contractor = await User.findOne({ _id: contractorId, role: 'contractor' });
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
    // Add User-Agent header as required by OSM Nominatim Usage Policy
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'UrbanMind-Civic-App/1.0 (contact@urbanmind.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

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
    const issue = await Issue.findById(req.params.id)
      .populate("userId", "name email")
      .populate("contractorId", "name companyName email");

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle upvote on an issue
export const upvoteIssue = async (req, res) => {
  try {
    const { issueId } = req.body;
    const userId = req.user.id;

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const alreadyUpvoted = issue.upvotedBy.includes(userId);

    if (alreadyUpvoted) {
      // Remove upvote
      issue.upvotedBy = issue.upvotedBy.filter(id => id.toString() !== userId);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
    } else {
      // Add upvote
      issue.upvotedBy.push(userId);
      issue.upvotes += 1;
    }

    await issue.save();

    res.json({
      message: alreadyUpvoted ? "Upvote removed" : "Upvoted successfully",
      upvotes: issue.upvotes,
      hasUpvoted: !alreadyUpvoted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit feedback after issue resolution
export const submitFeedback = async (req, res) => {
  try {
    const { issueId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    if (issue.status !== "resolved" && issue.status !== "closed") {
      return res.status(400).json({ message: "Feedback can only be given for resolved issues" });
    }

    issue.feedback = {
      rating: Number(rating),
      comment: comment || "",
      userId,
      createdAt: new Date()
    };

    await issue.save();

    res.json({ message: "Feedback submitted successfully", feedback: issue.feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get nearby issues using haversine distance
export const getNearbyIssues = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in km

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);

    const issues = await Issue.find({ "gps.lat": { $exists: true }, "gps.lng": { $exists: true } })
      .populate("userId", "name")
      .populate("contractorId", "name companyName")
      .sort({ upvotes: -1, createdAt: -1 });

    // Haversine formula to calculate distance
    const toRad = (deg) => (deg * Math.PI) / 180;
    const haversine = (lat1, lng1, lat2, lng2) => {
      const R = 6371; // Earth's radius in km
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const nearbyIssues = issues
      .map(issue => {
        const distance = haversine(userLat, userLng, issue.gps.lat, issue.gps.lng);
        return { ...issue.toObject(), distance: Math.round(distance * 10) / 10 };
      })
      .filter(issue => issue.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance);

    res.json(nearbyIssues);
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

// Check for duplicate/similar issues
export const checkDuplicates = async (req, res) => {
  try {
    const { title, lat, lng } = req.query;

    if (!title) {
      return res.json({ duplicates: [] });
    }

    // Get keywords from title (words with 3+ chars)
    const keywords = title.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
    if (keywords.length === 0) return res.json({ duplicates: [] });

    // Find issues that aren't resolved/closed
    const issues = await Issue.find({
      status: { $nin: ['resolved', 'closed'] }
    }).populate('userId', 'name').lean();

    const toRad = (deg) => (deg * Math.PI) / 180;
    const haversine = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const duplicates = issues
      .map(issue => {
        let score = 0;
        
        // Title similarity — check keyword overlap
        const issueWords = (issue.title || '').toLowerCase().split(/\s+/).filter(w => w.length >= 3);
        const matchingWords = keywords.filter(kw => issueWords.some(iw => iw.includes(kw) || kw.includes(iw)));
        const titleScore = keywords.length > 0 ? (matchingWords.length / keywords.length) * 60 : 0;
        score += titleScore;
        
        // Location proximity (within 500m = high score, within 2km = medium)
        if (lat && lng && issue.gps?.lat && issue.gps?.lng) {
          const distance = haversine(parseFloat(lat), parseFloat(lng), issue.gps.lat, issue.gps.lng);
          if (distance <= 0.5) score += 40;
          else if (distance <= 1) score += 25;
          else if (distance <= 2) score += 10;
        }

        return { ...issue, similarityScore: Math.round(score) };
      })
      .filter(issue => issue.similarityScore >= 30)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 5);

    res.json({ duplicates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};