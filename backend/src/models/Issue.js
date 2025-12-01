// backend/src/models/Issue.js
import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    description: String,
    imageUrl: String,
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
    fundAmount: { type: Number, default: 0 },
    fundApproved: { type: Boolean, default: false },
    category: String,
    gps: {
      lat: Number,
      lng: Number,
      address: String,
    },
    city: { type: String }, // To assign to City Admin
    upvotes: { type: Number, default: 0 },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: "Contractor" },
  },
  { timestamps: true }
);

export default mongoose.model("Issue", issueSchema);
