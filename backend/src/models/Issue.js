// backend/src/models/Issue.js
import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    description: String,
    images: [{ type: String }],
    voiceNoteUrl: String,
    status: {
      type: String,
      enum: [
        "reported",
        "assigned",
        "under_contractor_survey",
        "under_contractor",
        "fund_approval_pending",
        "in_progress",
        "resolved",
        "closed"
      ],
      default: "reported",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    fundAmount: { type: Number, default: 0 },
    fundApproved: { type: Boolean, default: false },
    costEstimate: {
      materials: { type: Number, default: 0 },
      labor: { type: Number, default: 0 },
      equipment: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      description: String
    },
    // Enhanced fund request details
    fundRequest: {
      purpose: { type: String, default: "" },
      workType: { type: String, default: "" },
      materialsList: [{ name: String, cost: Number }],
      timeline: { type: Number, default: 0 }, // estimated days
      notes: { type: String, default: "" }
    },
    category: String,
    gps: {
      lat: Number,
      lng: Number,
      address: String,
    },
    city: { type: String },
    // Voting system
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Feedback after resolution
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: "" },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date }
    },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Issue", issueSchema);
