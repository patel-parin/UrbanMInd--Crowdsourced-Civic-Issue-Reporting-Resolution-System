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
    city: { type: String }, // Lowest level (Village/City)
    state: { type: String },
    district: { type: String },
    taluka: { type: String },
    isSuperAdmin: { type: Boolean, default: false },
    impactPoints: { type: Number, default: 0 },
    citizenLevel: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
