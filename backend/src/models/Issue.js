// backend/src/models/Issue.js
import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    imageUrl: String,
    status: {
      type: String,
      enum: ["reported", "in_review", "assigned", "in_progress", "resolved"],
      default: "reported",
    },
    category: String,
    gps: {
      lat: Number,
      lng: Number,
      address: String,
    },
    upvotes: { type: Number, default: 0 },
    contractorId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

export default mongoose.model("Issue", issueSchema);
