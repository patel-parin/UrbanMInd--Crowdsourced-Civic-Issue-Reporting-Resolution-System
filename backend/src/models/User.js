// backend/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["citizen", "admin", "contractor", "superadmin"],
      default: "citizen",
    },
    // Location Fields
    city: { type: String }, // Lowest level (Village/City)
    state: { type: String },
    district: { type: String },
    taluka: { type: String },
    isSuperAdmin: { type: Boolean, default: false },
    impactPoints: { type: Number, default: 0 },
    citizenLevel: { type: Number, default: 1 },

    // Contractor Specific Fields
    companyName: String,
    assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Issue" }],
    rating: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    efficiency: { type: Number, default: 0 }, // Percentage or score
    costPerTask: { type: Number, default: 0 }, // Average cost
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
