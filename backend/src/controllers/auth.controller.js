import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import keys from "../config/keys.js";

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

// ==========================================
// REGISTER
// ==========================================
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "student"
    });

    res.json({
      success: true,
      message: "Registration successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// LOGIN
// ==========================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // SUPER ADMIN LOGIN
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

      return res.json({
        success: true,
        message: "Super Admin Login Successful",
        token,
        user: {
          _id: superUser._id,
          name: superUser.name,
          email: superUser.email,
          role: "superadmin"
        }
      });
    }

    // NORMAL USER LOGIN
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Password"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      keys.jwtSecret,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET LOGGED IN USER
// ==========================================
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true
    }).select("-password");

    res.json({
      success: true,
      message: "Profile updated",
      user
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
