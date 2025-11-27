// backend/src/models/ActivityLog.js
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    issueId: mongoose.Schema.Types.ObjectId,
    action: String,
    performedBy: String,
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activitySchema);
