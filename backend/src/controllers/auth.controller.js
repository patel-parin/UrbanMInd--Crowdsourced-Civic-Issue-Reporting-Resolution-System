import User from "../models/User.js";
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
      // Check if super admin exists in DB, if not create/update (optional, but good for ID consistency)
      // For simplicity, we'll return a special token or mock user object if not in DB, 
      // but ideally we should have a user record.
      // Let's check if a user with this email exists.
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

    // Verify requester is super admin (middleware should handle this, but double check)
    // For now, assuming route is protected by verifyToken and checkRole('superadmin')

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
