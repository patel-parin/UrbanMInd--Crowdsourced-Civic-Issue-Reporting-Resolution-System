import User from "../models/User.js";
import Contractor from "../models/Contractor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import keys from "../config/keys.js";

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "admin@urbanmind.com";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "admin123";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Prevent self-registration of admin or superadmin
    if (role === "admin" || role === "superadmin") {
      return res.status(403).json({ message: "Cannot register as admin. Contact Super Admin." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "citizen",
    });

    if (role === "contractor") {
      await Contractor.create({
        companyName: name,
        userId: user._id,
        rating: 0,
        completedTasks: 0,
        efficiency: 0,
        costPerTask: 0
      });
    }

    res.json({ message: "User Registered", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for Super Admin hardcoded login
    if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
      let superUser = await User.findOne({ email: SUPER_ADMIN_EMAIL });
      if (!superUser) {
        const hashed = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
        superUser = await User.create({
          name: "Super Admin",
          email: SUPER_ADMIN_EMAIL,
          password: hashed,
          role: "superadmin",
          isSuperAdmin: true
        });
      }

      const token = jwt.sign(
        { id: superUser._id, role: "superadmin" },
        keys.jwtSecret,
        { expiresIn: "7d" }
      );

      return res.json({ message: "Super Admin Login Successful", token, user: superUser });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ message: "Incorrect Password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      keys.jwtSecret,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login Successful", token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Only Super Admin can call this
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, city } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      name,
      email,
      password: hashed,
      role: "admin",
      city: city // Assign city to this admin
    });

    res.json({ message: "City Admin Created Successfully", admin: newAdmin });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, phone } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
