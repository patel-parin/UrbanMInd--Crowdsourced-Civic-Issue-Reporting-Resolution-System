// backend/src/models/Assignment.js
import mongoose from "mongoose";

const assignSchema = new mongoose.Schema(
  {
    issueId: mongoose.Schema.Types.ObjectId,
    contractorId: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      enum: ["assigned", "in_progress", "completed"],
      default: "assigned",
    },
    proofImage: String,
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignSchema);
