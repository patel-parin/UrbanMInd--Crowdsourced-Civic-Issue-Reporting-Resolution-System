// backend/src/models/Contractor.js
import mongoose from "mongoose";

const contractorSchema = new mongoose.Schema(
  {
    companyName: String,
    userId: mongoose.Schema.Types.ObjectId,
    assignedTasks: [mongoose.Schema.Types.ObjectId],
  },
  { timestamps: true }
);

export default mongoose.model("Contractor", contractorSchema);
