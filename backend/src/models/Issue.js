// backend/src/models/Issue.js
import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    description: String,
    images: [{ type: String }], // Changed from single imageUrl to array
    voiceNoteUrl: String, // New field for voice notes
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
    category: String,
    gps: {
      lat: Number,
      lng: Number,
      address: String,
    },
    city: { type: String }, // To assign to City Admin
    upvotes: { type: Number, default: 0 },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Changed ref to User (role: contractor)
  },
  { timestamps: true }
);

export default mongoose.model("Issue", issueSchema);
