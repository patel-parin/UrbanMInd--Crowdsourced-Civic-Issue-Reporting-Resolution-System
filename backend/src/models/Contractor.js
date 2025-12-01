// backend/src/models/Contractor.js
import mongoose from "mongoose";

const contractorSchema = new mongoose.Schema(
  {
    companyName: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Issue" }],
    rating: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    efficiency: { type: Number, default: 0 }, // Percentage or score
    costPerTask: { type: Number, default: 0 }, // Average cost
  },
  { timestamps: true }
);

export default mongoose.model("Contractor", contractorSchema);
